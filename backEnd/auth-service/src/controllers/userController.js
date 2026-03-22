import * as userService from "../service/userService.js";
import jwt from "jsonwebtoken";

const loginUser = async (req, res) => {
  try {
    const token = await userService.loginService(req.body);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { token } = await userService.registerService(req.body);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid admin account!" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const data = await userService.getProfileService(req.user.id);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserName = async (req, res) => {
  try {
    const user = await userService.updateNameService(req.user.id, req.body.newName);
    res.json({ success: true, message: "Update success", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    await userService.changePasswordService(req.user.id, req.body);
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const countUser = async (req, res) => {
  try {
    const count = await userService.getUsercount();
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error("User count error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user count"
    });
  }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserName, changePassword, countUser };