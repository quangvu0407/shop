import * as userService from "../service/userService.js";
import jwt from "jsonwebtoken";

const facebookCallback = async (req, res) => {
  try {
    const user = req.user;
    const access_token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refresh_token = jwt.sign({ id: String(user._id) }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    user.refreshToken = refresh_token;
    await user.save();

    // Redirect về FE kèm token trong query string
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth/callback?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=facebook_failed`);
  }
};

const loginUser = async (req, res) => {
  try {
    const { access_token, refresh_token } = await userService.loginService(req.body);
    res.json({ success: true, access_token, refresh_token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { access_token, refresh_token } = await userService.registerService(req.body);
    res.json({ success: true, access_token, refresh_token });
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
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get user count" });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await userService.listUsersService();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const tokens = await userService.refreshTokenService(refresh_token);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    await userService.logoutService(req.user.id);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserName, changePassword, countUser, listUsers, refreshToken, logoutUser, facebookCallback };