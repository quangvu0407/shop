import express from "express";
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserName, changePassword } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)

// protected route for obtaining current user info
userRouter.get('/profile', authUser, getUserProfile);
userRouter.post('/update-name', authUser, updateUserName);
userRouter.post('/change-password', authUser, changePassword);

export default userRouter;