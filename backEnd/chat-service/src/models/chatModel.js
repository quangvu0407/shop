import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  messages: [messageSchema],
  updatedAt: { type: Date, default: Date.now }
});

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);
export default chatModel;
