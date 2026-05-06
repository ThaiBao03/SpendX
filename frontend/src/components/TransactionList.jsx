import { useState, useEffect, useCallback } from "react";
import {
  Landmark,
  ShoppingBag,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getTransactions,
  deleteTransaction as apiDeleteTransaction,
} from "../lib/api";
import { AddTransactionModal } from "./AddTransactionModal";
import { EditTransactionModal } from "./EditTransactionModal";

const ICON_MAP = {
  income: { icon: Landmark, iconBg: "#dcfce7", iconColor: "#16a34a" },
  expense: { icon: ShoppingBag, iconBg: "#fee2e2", iconColor: "#dc2626" },
};

const PAGE_SIZE = 4;

function formatAmount(amount) {
  const abs = Math.abs(amount).toLocaleString("vi-VN");
  return (amount > 0 ? "+ " : "- ") + abs + " đ";
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function TransactionList({ onDataChange, selectedDate }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions();
      setTransactions(data);
      onDataChange?.(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onDataChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xoá giao dịch này?")) return;
    await apiDeleteTransaction(id);
    fetchData();
  };

  const isSearching = search.trim() !== "";

  // Xác định ngày đang được lọc:
  // - Nếu đang tìm kiếm → không lọc theo ngày (tất cả ngày)
  // - Nếu có selectedDate từ lịch → lọc theo ngày đó
  // - Mặc định → chỉ lấy hôm nay
  const activeDate = isSearching ? null : (selectedDate ?? new Date());

  const baseList = activeDate
    ? transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getFullYear() === activeDate.getFullYear() &&
          d.getMonth() === activeDate.getMonth() &&
          d.getDate() === activeDate.getDate()
        );
      })
    : transactions;

  // Lọc theo tab type
  const typeFiltered = baseList.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  // Lọc theo từ khoá (title, note)
  const q = search.trim().toLowerCase();
  const filtered = isSearching
    ? typeFiltered.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q)
      )
    : typeFiltered;

  // Pagination — chỉ tính khi có kết quả
  const totalPages = filtered.length > 0 ? Math.ceil(filtered.length / PAGE_SIZE) : 0;
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Tổng thu của ngày được chọn (hoặc hôm nay nếu chưa chọn)
  const incomeDateRef = selectedDate ?? new Date();
  const displayIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "income" &&
        d.getFullYear() === incomeDateRef.getFullYear() &&
        d.getMonth() === incomeDateRef.getMonth() &&
        d.getDate() === incomeDateRef.getDate()
      );
    })
    .reduce((s, t) => s + t.amount, 0);

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Tìm kiếm giao dịch trên tất cả các ngày..."
            className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-10 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition-all"
          />
          {isSearching && (
            <button
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 text-[10px] font-bold transition-colors"
              title="Xoá tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-1 gap-2">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
            {isSearching
              ? "Kết quả tìm kiếm"
              : selectedDate
              ? selectedDate.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              : "Thu nhập hôm nay"}
          </h1>
          <p className="text-slate-400 text-[12px] lg:text-[13px] font-medium mt-0.5">
            {isSearching
              ? `Tìm thấy ${filtered.length} giao dịch`
              : selectedDate
              ? `${filtered.length} giao dịch trong ngày này`
              : new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight">
            {displayIncome.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 my-4">
        {[
          { key: "all", label: "Tất cả" },
          { key: "expense", label: "Chi phí" },
          { key: "income", label: "Thu nhập" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all border
              ${filter === key
                ? "bg-blue-700 text-white border-blue-700 shadow"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction rows */}
      <div className="flex flex-col gap-3 flex-1">
        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-[13px]">Đang tải...</span>
          </div>
        )}
        {error && (
          <div className="text-center py-8 text-rose-500 text-[13px]">
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            {isSearching ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl select-none">🔍</div>
                <p className="text-slate-600 text-[14px] font-semibold">Không tìm thấy kết quả</p>
                <p className="text-slate-400 text-[12px]">Thử từ khoá khác hoặc đổi bộ lọc</p>
              </>
            ) : selectedDate ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl select-none">📅</div>
                <p className="text-slate-600 text-[14px] font-semibold">Không có giao dịch ngày này</p>
                <p className="text-slate-400 text-[12px]">
                  {selectedDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl select-none">🌤️</div>
                <p className="text-slate-600 text-[14px] font-semibold">Hôm nay bạn chưa chi tiêu gì</p>
                <p className="text-slate-400 text-[12px]">Nhấn nút bên dưới để thêm giao dịch đầu tiên!</p>
              </>
            )}
          </div>
        )}

        {!loading && !error && paginated.map((t) => {
          const { icon: Icon, iconBg, iconColor } = ICON_MAP[t.type] ?? ICON_MAP.expense;
          const amount = t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount);
          return (
            <div
              key={t._id}
              onClick={() => setActiveCardId(activeCardId === t._id ? null : t._id)}
              className="group flex items-center bg-white rounded-2xl px-3 lg:px-4 py-3 lg:py-3.5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon size={18} style={{ color: iconColor }} />
                </div>
                <div>
                  <p className={`text-[14px] lg:text-[15px] font-bold leading-tight ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatAmount(amount)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {isSearching ? formatDate(t.date) : formatTime(t.date)}
                  </p>
                </div>
              </div>

              <span className="flex-1 min-w-0 text-[13px] lg:text-[14px] font-semibold text-slate-700 text-right px-2 lg:px-3 truncate">
                {t.title}
              </span>

              {/* Action buttons */}
              <div
                className={`flex-shrink-0 flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out
                  ${activeCardId === t._id
                    ? "max-w-[80px] opacity-100"
                    : "max-w-0 opacity-0 lg:group-hover:max-w-[80px] lg:group-hover:opacity-100"
                  }`}
              >
                <button
                  title="Sửa"
                  onClick={(e) => { e.stopPropagation(); setEditingTransaction(t); }}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors shadow-sm"
                >
                  <Pencil size={15} />
                </button>
                <button
                  title="Xoá"
                  onClick={(e) => handleDelete(t._id, e)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors shadow-sm"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination — chỉ render khi có hơn 1 trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 px-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1 text-[13px] text-slate-500 hover:text-blue-700 font-medium transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} />
            Trước
          </button>
          <div className="flex items-center gap-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-full text-[13px] font-bold transition-all flex items-center justify-center
                  ${safePage === p ? "bg-blue-700 text-white shadow" : "text-slate-400 hover:text-blue-700"}`}
              >
                {String(p).padStart(2, "0")}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 text-[13px] text-slate-500 hover:text-blue-700 font-medium transition-colors disabled:opacity-30"
          >
            Tiếp
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-center mt-5">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full shadow-lg text-[14px] transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Thêm giao dịch
        </button>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Add Modal */}
      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
