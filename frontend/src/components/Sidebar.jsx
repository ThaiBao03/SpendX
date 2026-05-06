import {
  LayoutDashboard,
  ReceiptText,
  PiggyBank,
  BarChart3,
  Settings,
  HelpCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Bảng điều khiển", active: true },
  { icon: ReceiptText, label: "Giao dịch", active: false },
  { icon: PiggyBank, label: "Ngân sách", active: false },
  { icon: BarChart3, label: "Báo cáo", active: false },
  { icon: Settings, label: "Cài đặt", active: false },
];

const DAY_HEADERS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function MiniCalendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    const day = daysInPrevMonth - firstDayOfMonth + 1 + i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ date: new Date(prevYear, prevMonth, day), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), current: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ date: new Date(nextYear, nextMonth, nextDay++), current: false });
  }

  const handleDayClick = (cell) => {
    if (!cell.current) return;
    if (selectedDate && isSameDay(selectedDate, cell.date)) {
      onSelectDate(null);
    } else {
      onSelectDate(cell.date);
    }
  };

  return (
    <div className="mx-3 mt-4 bg-white rounded-2xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
          {MONTH_NAMES[viewMonth]}, {viewYear}
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={goToPrevMonth}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={goToNextMonth}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <table className="w-full text-center">
        <thead>
          <tr>
            {DAY_HEADERS.map((h) => (
              <th key={h} className="text-[10px] font-semibold text-slate-400 pb-1 w-7">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
            <tr key={rowIdx}>
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                const isTodayCell = isSameDay(cell.date, today);
                const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
                return (
                  <td key={colIdx} className="py-0.5">
                    <button
                      onClick={() => handleDayClick(cell)}
                      disabled={!cell.current}
                      className={`
                        inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium transition-all
                        ${!cell.current
                          ? "text-slate-300 cursor-default"
                          : isSelected
                          ? "bg-blue-600 text-white font-bold shadow-sm scale-110"
                          : isTodayCell
                          ? "bg-blue-100 text-blue-700 font-bold ring-1 ring-blue-400"
                          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                        }
                      `}
                    >
                      {cell.date.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDate && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-1">
          <span className="text-[10px] text-blue-600 font-semibold">
            {selectedDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="text-[10px] text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Xoá chọn
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, selectedDate, onSelectDate }) {
  return (
    <>
      {/* Backdrop — hiện khi sidebar mở rộng trên màn nhỏ */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-[#e8edff] flex flex-col border-r border-blue-100
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Toggle button + Logo row */}
        <div className={`flex items-center px-3 mb-5 pt-6 ${collapsed ? "justify-center" : "justify-between gap-2.5"}`}>
          {/* Logo (chỉ hiện khi mở rộng) */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow flex-shrink-0">
                <Wallet size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[15px] font-bold tracking-tight text-blue-900 leading-tight block truncate">
                  Precision Ledger
                </span>
                <p className="text-[9px] tracking-widest uppercase text-blue-400 font-semibold leading-tight">
                  NHÀ PHÂN TÍCH CẤU TRÚC
                </p>
              </div>
            </div>
          )}

          {/* Toggle button (khi thu gọn sẽ ở giữa, không dùng absolute) */}
          <button
            onClick={onToggle}
            className={`
              w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-blue-200 text-slate-500 hover:text-blue-800 transition-colors flex-shrink-0
            `}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 rounded-xl text-[13.5px] font-semibold
                transition-all cursor-pointer w-full
                ${collapsed ? "justify-center px-0 py-3" : "px-4 py-2.5 text-left"}
                ${active
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-blue-100 hover:text-blue-800"
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Calendar — chỉ hiện khi mở rộng */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto">
            <MiniCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
          </div>
        )}

        {/* Help */}
        <div className={`mt-auto pb-4 ${collapsed ? "flex justify-center" : "px-5"}`}>
          <button
            title={collapsed ? "Trợ giúp" : undefined}
            className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-blue-700 font-medium transition-colors"
          >
            <HelpCircle size={16} className="flex-shrink-0" />
            {!collapsed && "Trung tâm trợ giúp"}
          </button>
        </div>
      </aside>
    </>
  );
}