import express from "express";
import cors from "cors";
import transactionRoute from "./routes/transactionRouters.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5001;

// Lấy __dirname (do dùng type: module)
const __dirname = path.resolve();

const app = express();

// Cập nhật CORS để cho phép Frontend (Vercel) gọi API
// Dấu * tạm thời cho phép mọi origin, bạn có thể thay bằng URL thật của Frontend sau khi deploy
app.use(cors({ origin: "*" })); 
app.use(express.json());

app.use("/api/transactions", transactionRoute);

app.get("/", (req, res) => {
  res.send("SpendX API is running perfectly on Vercel!");
});
// Chỉ chạy app.listen ở môi trường local (Dev)
// Vercel sẽ tự động có biến môi trường VERCEL="1"
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server bắt đầu chạy trên cổng ${PORT}!`);
    });
  });
} else {
  // Ở production (Vercel), chỉ cần connect DB
  connectDB();
}

// Export app để Vercel nhận diện làm Serverless Function
export default app;
