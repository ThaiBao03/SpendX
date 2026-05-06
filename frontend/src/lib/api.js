// Lấy URL từ biến môi trường (trên Vercel), nếu không có thì dùng mặc định (Dev proxy)
const BASE = (import.meta.env.VITE_API_URL || "") + "/api/transactions";

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Lấy toàn bộ giao dịch */
export const getTransactions = () => request(BASE);

/** Tạo giao dịch mới
 * @param {{ title: string, amount: number, type: "income"|"expense", date?: string }} data
 */
export const createTransaction = (data) =>
  request(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

/** Cập nhật giao dịch theo id */
export const updateTransaction = (id, data) =>
  request(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

/** Xoá giao dịch theo id */
export const deleteTransaction = (id) =>
  request(`${BASE}/${id}`, { method: "DELETE" });
