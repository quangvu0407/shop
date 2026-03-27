import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getWelcomeMessage
} from "../services/chatService.js";

// POST /message
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;
    const authHeader = req.headers.authorization;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Tin nhắn không được để trống" });
    }

    const result = await sendMessage(userId, message.trim(), authHeader);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Chat error:", error.message);
    console.error("Chat error detail:", error.status, error.error?.error?.failed_generation || error.response?.data);
    res.status(500).json({ success: false, message: "Chatbot tạm thời không khả dụng" });
  }
};

// GET /history
const history = async (req, res) => {
  try {
    const messages = await getChatHistory(req.userId);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /clear
const clear = async (req, res) => {
  try {
    await clearChatHistory(req.userId);
    res.json({ success: true, message: "Đã xóa lịch sử chat" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /welcome
const welcome = async (req, res) => {
  res.json({ success: true, ...getWelcomeMessage() });
};

export { chat, history, clear, welcome };
