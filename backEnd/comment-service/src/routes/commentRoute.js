import express from "express";
import { addComment, listComments } from "../controllers/commentController.js";
import authUser from "../middleware/auth.js";

const commentRouter = express.Router();

commentRouter.get("/list/:productId", listComments);
commentRouter.post("/add", authUser, addComment);

export default commentRouter;
