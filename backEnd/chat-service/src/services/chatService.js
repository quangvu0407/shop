import OpenAI from "openai";
import chatModel from "../models/chatModel.js";
import 'dotenv/config';
import { fetchUserOrders, placeOrderCOD, searchProducts } from "./ragService.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `Bạn là trợ lý mua sắm của cửa hàng thời trang. Trả lời bằng tiếng Việt.

Bạn có thể thực hiện các action sau bằng cách trả về JSON:

1. Tìm sản phẩm (khi user hỏi về sản phẩm, muốn xem, muốn tìm):
{"action":"search","query":"jeans"}

2. Xem đơn hàng (khi user hỏi về đơn hàng của họ):
{"action":"get_orders"}

3. Đặt hàng - CHỈ khi user đã XÁC NHẬN muốn đặt VÀ đã cung cấp ĐỦ: địa chỉ, họ tên, SĐT, email(bắt buộc phải đủ):
{"action":"place_order","items":[{"productId":"<id thật>","name":"...","price":0,"size":"M","quantity":1}],"firstName":"...","lastName":"...","street":"...","city":"...","phone":"..."}

4. Trả lời thông thường:
{"action":"reply","message":"..."}

Quy tắc QUAN TRỌNG:
- Khi user nhắn tên sản phẩm → action "search", KHÔNG phải đặt hàng
- Chỉ action "place_order" khi user nói rõ "đặt hàng", "mua" VÀ đã có đủ địa chỉ giao hàng
- Nếu thiếu địa chỉ → action "reply" để hỏi thêm thông tin
- Query search PHẢI tiếng Anh. Nếu user nhắn tên sản phẩm cụ thể thì giữ NGUYÊN tên đó làm query. Nếu user mô tả chung thì dùng 1-2 từ: "shirt", "jeans", "dress", "top", "jacket"
- PHẢI search trước để lấy productId thật, KHÔNG tự bịa productId`;

const executeTool = async (action, data, authHeader) => {
  switch (action) {
    case "search": {
      const products = await searchProducts(data.query);
      if (!products.length) return `Không tìm thấy sản phẩm với từ khóa "${data.query}".`;
      return products.map(p =>
        `[ID:${p._id}] ${p.name} | Giá: ${Number(p.price).toLocaleString("vi-VN")}đ | Size: ${(p.sizes || []).join(", ")} | Còn: ${p.quantity > 0 ? p.quantity : "Hết hàng"}`
      ).join("\n");
    }
    case "get_orders": {
      const orders = await fetchUserOrders(authHeader);
      if (!orders.length) return "Bạn chưa có đơn hàng nào.";
      return orders.map((o, i) => {
        const items = o.items.map(it => `${it.name} x${it.quantity} (${it.size})`).join(", ");
        const date = new Date(o.date).toLocaleDateString("vi-VN");
        return `Đơn ${i + 1}: ${items} | Tổng: ${Number(o.amount).toLocaleString("vi-VN")}đ | Trạng thái: ${o.status} | Ngày: ${date}`;
      }).join("\n");
    }
    case "place_order": {
      const { items, firstName, lastName, street, city, phone } = data;
      const invalidIds = (items || []).filter(i => !/^[a-f\d]{24}$/i.test(i.productId));
      if (invalidIds.length > 0) return `❌ productId không hợp lệ. Hãy search sản phẩm trước.`;
      const address = { firstName, lastName, street, city, phone };
      const amount = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + 10;
      const result = await placeOrderCOD({ items, amount, address, authHeader });
      if (result?.success) return `✅ Đặt hàng thành công! Tổng: ${Number(amount).toLocaleString("vi-VN")}đ. Thanh toán khi nhận hàng.`;
      return `❌ Đặt hàng thất bại: ${result?.message || "Lỗi không xác định"}`;
    }
    default:
      return null;
  }
};

const getOrCreateSession = async (userId) => {
  let session = await chatModel.findOne({ userId });
  if (!session) {
    session = new chatModel({ userId, messages: [] });
    await session.save();
  }
  return session;
};

export const sendMessage = async (userId, userMessage, authHeader) => {
  const session = await getOrCreateSession(userId);

  const recentMessages = session.messages.slice(-10).map(m => ({
    role: m.role,
    content: m.content
  }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recentMessages,
    { role: "user", content: userMessage }
  ];

  let assistantMessage = "";

  for (let i = 0; i < 5; i++) {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1024
    });

    const raw = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      assistantMessage = raw;
      break;
    }

    // Action reply → trả lời thẳng
    if (parsed.action === "reply" || !parsed.action) {
      assistantMessage = parsed.message || raw;
      break;
    }

    // Thực thi action
    const toolResult = await executeTool(parsed.action, parsed, authHeader);

    // Đưa kết quả vào context để model tiếp tục
    messages.push({ role: "assistant", content: raw });
    messages.push({ role: "user", content: `[Kết quả]: ${toolResult}` });
  }

  if (!assistantMessage) assistantMessage = "Xin lỗi, mình không thể xử lý yêu cầu này lúc này.";

  session.messages.push({ role: "user", content: userMessage });
  session.messages.push({ role: "assistant", content: assistantMessage });
  session.updatedAt = new Date();
  await session.save();

  return { message: assistantMessage, sessionId: session._id };
};

export const getChatHistory = async (userId) => {
  const session = await chatModel.findOne({ userId });
  return session ? session.messages : [];
};

export const clearChatHistory = async (userId) => {
  await chatModel.findOneAndUpdate({ userId }, { messages: [], updatedAt: new Date() });
};

export const getWelcomeMessage = () => ({
  role: "assistant",
  content: "Xin chào! Mình là trợ lý mua sắm của cửa hàng 😊 Mình có thể giúp bạn tìm sản phẩm, xem đơn hàng, hoặc đặt hàng COD. Bạn cần gì nào?"
});
