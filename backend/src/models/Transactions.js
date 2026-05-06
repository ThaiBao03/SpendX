import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      trim: true,
    },
    amount: {
      type: Number,
      require: true,
      min: 0,
    },
    type: {
      type: String,
      require: true,
      enum: ["income", "expense"],
    },
    date: {
      type: Date,
      deault: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
