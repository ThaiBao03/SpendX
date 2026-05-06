import { useState } from "react";
import { X, Save, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { updateTransaction } from "../lib/api";

const CATEGORIES = {
  income: ["Lương", "Thưởng", "Đầu tư", "Kinh doanh", "Cổ tức", "Phí tư vấn", "Khác"],
  expense: ["Ăn uống", "Mua sắm", "Di chuyển", "Giải trí", "Y tế", "Giáo dục", "Hóa đơn", "Khác"],
};

export function EditTransactionModal({ transaction, onClose, onSuccess }) {
  const [type, setType] = useState(transaction.type);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(
    Math.abs(transaction.amount).toLocaleString("vi-VN")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const numAmount = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Số tiền không hợp lệ!");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await updateTransaction(transaction._id, {
        title: title.trim(),
        amount: numAmount,
        type,
        date: transaction.date, // giữ nguyên ngày gốc
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw ? Number(raw).toLocaleString("vi-VN") : "");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight">
              Sửa giao dịch
            </h2>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Cập nhật thông tin giao dịch
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="px-6 mb-4">
          <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all
                ${type === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <TrendingUp size={14} /> Thu nhập
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all
                ${type === "expense" ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <TrendingDown size={14} /> Chi phí
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Tiêu đề
            </label>
            <div>
              <select
                value={CATEGORIES[type].includes(title) ? title : ""}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none mb-2"
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES[type].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Hoặc nhập tên giao dịch..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Số tiền */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Số tiền (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">đ</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-rose-500 text-[12px] font-medium bg-rose-50 px-3 py-2 rounded-xl">
              ⚠️ {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-white transition-all shadow-lg
                ${type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}
                disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
