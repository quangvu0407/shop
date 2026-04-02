import userModel from "../models/userModel.js";
import mongoose from "mongoose";
// import orderModel from "../models/orderModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

// Helper tạo access_token (15 phút)
const createToken = (id) => {
  return jwt.sign({ id: String(id) }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

// Helper tạo refresh_token (7 ngày)
const createRefreshToken = (id) => {
  return jwt.sign({ id: String(id) }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// 1. Service Đăng ký
export const registerService = async ({ name, email, password }) => {
  const exists = await userModel.findOne({ email });
  if (exists) throw new Error("User already exists");

  if (!validator.isEmail(email)) throw new Error("Please enter a valid email");
  if (password.length < 8) throw new Error("Please enter a strong password (min 8 characters)");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({ name, email, password: hashedPassword });
  const user = await newUser.save();

  const access_token = createToken(user._id);
  const refresh_token = createRefreshToken(user._id);
  user.refreshToken = refresh_token;
  await user.save();

  return { access_token, refresh_token, user };
};

// 2. Service Đăng nhập User
export const loginService = async ({ email, password }) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User doesn't exist");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  const access_token = createToken(user._id);
  const refresh_token = createRefreshToken(user._id);
  user.refreshToken = refresh_token;
  await user.save();

  return { access_token, refresh_token };
};

// 3. Service Lấy Profile (orderCount lấy từ order-service ở FE hoặc mở rộng sau)
export const getProfileService = async (userId) => {
  if (userId == null || String(userId).trim() === "") {
    throw new Error("User not found");
  }
  const id = String(userId).trim();
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid user id");
  }
  const user = await userModel.findById(id).select("-password").lean();
  if (!user) throw new Error("User not found");
  return { user };
};

// 4. Service Cập nhật tên
export const updateNameService = async (userId, newName) => {
  if (!newName) throw new Error("Input your new name");

  const user = await userModel.findByIdAndUpdate(
    userId,
    { name: newName },
    { new: true }
  ).select('-password');

  return user;
};

// 5. Service Đổi mật khẩu
export const changePasswordService = async (userId, { oldPassword, newPassword }) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu cũ không chính xác");

  if (newPassword.length < 8) throw new Error("Please enter strong password");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return true;
};

export const getUsercount = async () => {
  const count = await userModel.countDocuments();
  return count;
}

// 6. Service Refresh Token
export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await userModel.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Refresh token mismatch");
  }

  const access_token = createToken(user._id);
  const new_refresh_token = createRefreshToken(user._id);
  user.refreshToken = new_refresh_token;
  await user.save();

  return { access_token, refresh_token: new_refresh_token };
};

// 7. Service Logout — xóa refresh token
export const logoutService = async (userId) => {
  await userModel.findByIdAndUpdate(userId, { refreshToken: null });
};
