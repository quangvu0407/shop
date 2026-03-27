import express from "express";
import { chat, history, clear, welcome } from "../controllers/chatController.js";
import authUser from "../middleware/auth.js";

const chatRouter = express.Router();

// Middleware gán userId từ req.user.id sang req.userId
const setUserId = (req, res, next) => {
  req.userId = req.user?.id;
  next();
};

// Không cần auth - gọi khi vào web để lấy tin nhắn chào
chatRouter.get("/welcome", welcome);

// Cần auth
chatRouter.post("/message", authUser, setUserId, chat);
chatRouter.get("/history", authUser, setUserId, history);
chatRouter.delete("/clear", authUser, setUserId, clear);

export default chatRouter;
