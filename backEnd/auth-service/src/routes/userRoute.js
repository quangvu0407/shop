import express from "express";
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserName, changePassword, countUser, listUsers, refreshToken, logoutUser, facebookCallback } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import passport from "../config/passport.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/refresh-token', refreshToken)
userRouter.post('/logout', authUser, logoutUser)

// Facebook OAuth
userRouter.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false }))
userRouter.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  facebookCallback
)

// protected route for obtaining current user info
userRouter.get('/profile', authUser, getUserProfile);
userRouter.post('/update-name', authUser, updateUserName);
userRouter.post('/change-password', authUser, changePassword);

//data dashboard
userRouter.get("/count", adminAuth, countUser);
userRouter.get("/list", adminAuth, listUsers);

export default userRouter;