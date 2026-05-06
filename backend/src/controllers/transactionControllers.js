import Transaction from "../models/Transactions.js";

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Lỗi khi gọi getAllTransaction", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;
    if (!title || !amount || !type) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
    }
    const transaction = new Transaction({
      title,
      amount,
      type,
      date: date || new Date(),
    });
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Lỗi khi gọi createTransaction", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;
    const updateTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        title,
        amount,
        type,
        date,
      },
      { new: true },
    );
    if (!updateTransaction) {
      return res.status(404).json({ message: "Mục chi tiêu không tồn tại." });
    }
    res.status(200).json(updateTransaction);
  } catch (error) {
    console.error("Lỗi khi gọi updateTransaction", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const deleteTransaction = await Transaction.findByIdAndDelete(
      req.params.id,
    );
    if (!deleteTransaction) {
      return res.status(404).json({ message: "Mục chi tiêu không tồn tại." });
    }
    res.status(200).json(deleteTransaction);
  } catch (error) {
    console.error("Lỗi khi gọi deleteTransaction", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};
