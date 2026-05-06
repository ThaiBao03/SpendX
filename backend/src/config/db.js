import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Kết nối CSDL thành công!");
  } catch (error) {
    console.error("Lỗi kết nối CSDL:", error);
    process.exit(1);
  }
};
