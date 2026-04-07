import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Promotion DB connected"));
  await mongoose.connect(`${process.env.MONGODB_URI}/promotionDB`);
};

export default connectDB;
