import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { TransactionList } from "../components/TransactionList";
import { FinancialSummary } from "../components/FinancialSummary";

const HomePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Sidebar collapsed: true trên mobile/tablet (<lg), false trên desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  // Lắng nghe resize để tự động điều chỉnh
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: luôn mở rộng
        setSidebarCollapsed(false);
      } else {
        // Mobile/tablet: thu về icon khi resize xuống nhỏ
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // Chiều rộng sidebar: 4rem (icon) khi thu gọn, 16rem khi mở rộng
  // Trên mobile: khi mở rộng sidebar overlay content → content không đổi marginLeft
  const contentMargin = sidebarCollapsed ? "ml-16" : "ml-16 lg:ml-64";

  return (
    <div className="flex min-h-screen bg-[#f0f3ff]">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Content area — offset theo chiều rộng sidebar */}
      <div className={`flex flex-1 min-w-0 transition-all duration-300 ${contentMargin}`}>
        <div className="flex flex-col lg:flex-row w-full min-w-0 max-w-[1100px] mx-auto px-4 lg:px-6">

          {/* Transactions — full width trên mobile, flex-1 trên desktop */}
          <main className="flex-1 min-w-0 py-6 lg:pr-6">
            <TransactionList
              onDataChange={setTransactions}
              selectedDate={selectedDate}
            />
          </main>

          {/* Financial Summary — bên dưới trên mobile, bên phải trên desktop */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0 pb-6 lg:py-6">
            <FinancialSummary transactions={transactions} />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
