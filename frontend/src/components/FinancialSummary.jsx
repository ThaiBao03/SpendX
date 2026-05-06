import { TrendingUp, TrendingDown } from "lucide-react";

function DonutChart({ percentage = 70, balance = 0 }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percentage, 100) / 100);

  return (
    <div className="relative w-36 h-36 lg:w-44 lg:h-44 mx-auto flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="#e2e8f0" strokeWidth="14" fill="transparent" />
        <circle
          cx="80" cy="80" r={radius}
          stroke="#15803d" strokeWidth="14" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">SỐ DƯ</p>
        <p className="text-[13px] font-black text-slate-900 mt-0.5 leading-tight">
          {balance.toLocaleString("vi-VN")} đ
        </p>
      </div>
    </div>
  );
}

export function FinancialSummary({ transactions = [] }) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const percentage = totalIncome > 0
    ? Math.round((balance / totalIncome) * 100)
    : 0;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return `${Math.round(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.round(diff / 3600)} giờ trước`;
    return `${Math.round(diff / 86400)} ngày trước`;
  }

  return (
    <div className="bg-transparent">
      {/* Header */}
      <div className="mb-4 text-center lg:text-right">
        <h2 className="text-[18px] font-black text-slate-900 tracking-tight">
          Tóm tắt tài chính
        </h2>
        <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
          TỔNG QUAN THỜI GIAN THỰC
        </p>
      </div>

      {/* Mobile: Donut + Income/Expense stack vertically and centered */}
      <div className="flex flex-col lg:block items-center gap-6 mb-4 lg:mb-0 lg:space-y-4">
        {/* Donut */}
        <div className="flex-shrink-0">
          <DonutChart percentage={percentage} balance={balance} />
        </div>

        {/* Income & Expense cards */}
        <div className="w-full flex flex-col gap-2.5 lg:mt-4">
          {/* Thu nhập */}
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-9 bg-emerald-500 rounded-full" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">THU NHẬP</p>
                <p className="text-[13px] lg:text-[15px] font-bold text-slate-800 leading-tight">
                  {totalIncome.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp size={11} /> {transactions.filter((t) => t.type === "income").length}
            </span>
          </div>

          {/* Chi phí */}
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-9 bg-rose-500 rounded-full" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CHI PHÍ</p>
                <p className="text-[13px] lg:text-[15px] font-bold text-slate-800 leading-tight">
                  {totalExpense.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
            <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
              <TrendingDown size={11} /> {transactions.filter((t) => t.type === "expense").length}
            </span>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="mt-4">
          <h3 className="text-[13px] font-bold text-slate-800 mb-3">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recent.map((t) => (
              <div key={t._id} className="flex gap-2.5">
                <div
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    t.type === "income" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <div>
                  <p className="text-[12.5px] text-slate-700 leading-snug">
                    {t.title}{" "}
                    <span
                      className={`font-semibold ${
                        t.type === "income" ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {t.amount.toLocaleString("vi-VN")} đ
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    {timeAgo(t.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
