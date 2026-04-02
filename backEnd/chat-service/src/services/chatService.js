import OpenAI from "openai";
import chatModel from "../models/chatModel.js";
import "dotenv/config";
import {
  fetchUserOrders,
  placeOrderCOD,
  searchProducts,
} from "./ragService.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const HISTORY_LIMIT = 10;

// ── Vietnamese slang/abbreviation normalization ───────────────────────────────
const VI_NORMALIZE_MAP = {
  "ao phong": "t-shirt",
  "áo phông": "t-shirt",
  "áo thun": "t-shirt",
  "quan jean": "jeans",
  "quần jean": "jeans",
  "quần bò": "jeans",
  "quan tay": "trousers",
  "quần tây": "trousers",
  "ao khoac": "jacket",
  "áo khoác": "jacket",
  vay: "skirt",
  váy: "skirt",
  dam: "dress",
  đầm: "dress",
  giay: "shoes",
  giày: "shoes",
  dep: "sandals",
  dép: "sandals",
  "ao so mi": "shirt",
  "áo sơ mi": "shirt",
  "ao len": "sweater",
  "áo len": "sweater",
  "quan short": "shorts",
  "quần short": "shorts",
  mu: "hat",
  mũ: "hat",
  non: "hat",
  nón: "hat",
  tui: "bag",
  túi: "bag",
  vi: "wallet",
  ví: "wallet",
  "di choi": "casual",
  "đi chơi": "casual",
  "di lam": "formal",
  "đi làm": "formal",
  "the thao": "sport",
  "thể thao": "sport",
};

const normalizeVietnamese = (text) => {
  let normalized = text.toLowerCase();
  for (const [vi, en] of Object.entries(VI_NORMALIZE_MAP)) {
    normalized = normalized.replace(new RegExp(vi, "gi"), en);
  }
  return normalized;
};

// ── Master prompt ─────────────────────────────────────────────────────────────
const buildMasterPrompt = (productContext, userPrefs) => `
Bạn là trợ lý mua sắm thời trang thông minh. Phân tích tin nhắn và trả về JSON duy nhất, KHÔNG markdown.

${productContext ? `[SẢN PHẨM USER ĐÃ XEM]\n${productContext}\n` : ""}
${userPrefs ? `[SỞ THÍCH USER ĐÃ BIẾT]\n${userPrefs}\n` : ""}

Format JSON trả về:
{
  "action": "<action>",
  "query": "<English 1-3 words>",
  "refineQuery": "<English keywords>",
  "compareIds": ["id1","id2"],
  "items": [], "firstName":"","lastName":"","street":"","city":"","phone":"",
  "message": "<Vietnamese reply>",
  "extractedPrefs": {
    "size": null,
    "occasion": null,
    "budget": null,
    "gender": null,
    "age": null
  }
}

DATABASE CHỈ CÓ:
- category: "Men" | "Women" | "Kids"
- subCategory: "Topwear" | "Bottomwear" | "Winterwear"
- Tên sản phẩm tiếng Anh (t-shirt, jeans, jacket, coat, blouse, chinos, jogger...)

ACTIONS:
- "search"        — user đề cập loại sản phẩm → query tiếng Anh, kết hợp gender + loại sản phẩm cụ thể
- "refine_search" — user phản hồi kết quả
- "compare"       — user muốn so sánh ≥2 sản phẩm
- "get_orders"    — user hỏi đơn hàng
- "place_order"   — user xác nhận mua VÀ đủ địa chỉ
- "reply"         — chào hỏi, tư vấn chung

QUY TẮC SEARCH — QUAN TRỌNG:
- gender=Men    → prefix query bằng "men"
- gender=Women  → prefix query bằng "women"  
- gender=Kids   → prefix query bằng "kids"
- occasion/style → map sang loại sản phẩm thực tế:
  * casual     → t-shirt, jeans, shorts, top
  * công sở    → shirt, trousers, blouse, chinos
  * street     → oversized tee, jacket, jogger
  * thể thao   → track pants, sport top
  * mùa đông   → jacket, coat, sweater, hoodie
- Ví dụ: gender=Women + occasion=casual → query = "women top" hoặc "women jeans"
- KHÔNG search "women casual" vì DB không có field style

QUY TẮC "reply" — BẮT BUỘC THEO THỨ TỰ:
- gender=null    → HỎI NGAY: "Bạn đang tìm đồ nam, nữ hay trẻ em?"
- gender có rồi, occasion=null → hỏi: "Bạn cần mặc dịp gì? (đi chơi, đi làm, thể thao, mùa đông...)"
- gender+occasion có rồi, budget=null → hỏi: "Ngân sách khoảng bao nhiêu?"
- Sau khi biết occasion → GỢI Ý NGAY loại sản phẩm phù hợp từ DB
- Hỏi TỐI ĐA 2 câu mỗi lần
- KHÔNG hỏi lại thứ đã có trong [SỞ THÍCH USER ĐÃ BIẾT]
`;

// ── Upsell map ────────────────────────────────────────────────────────────────
const UPSELL_RULES = {
  "t-shirt": ["jeans", "jacket"],
  shirt: ["trousers", "jacket"],
  dress: ["shoes", "bag"],
  jeans: ["shirt", "shoes"],
  jacket: ["shirt", "jeans"],
  shoes: ["socks", "bag"],
  skirt: ["top", "shoes"],
  sweater: ["jeans", "coat"],
  shorts: ["t-shirt", "sandals"],
};

// Thêm map này vào đầu file
const STYLE_TO_QUERY = {
  casual: { keywords: ["t-shirt", "jeans", "shorts", "top"] },
  "công sở": { keywords: ["shirt", "trousers", "blouse", "chinos"] },
  formal: { keywords: ["shirt", "trousers", "blouse", "chinos"] },
  street: { keywords: ["oversized", "jacket", "jogger", "graphic tee"] },
  "thể thao": { keywords: ["track pants", "sport top", "jogger"] },
  "mùa đông": { keywords: ["jacket", "coat", "sweater", "hoodie"] },
  winterwear: { keywords: ["jacket", "coat", "sweater", "hoodie"] },
};

// ── Format helpers ────────────────────────────────────────────────────────────
const formatProduct = (p, index) => {
  const link = `${FRONTEND_URL}/product/${p._id}`;
  const sizes = (p.sizes || []).join(", ") || "N/A";
  const stock = p.quantity > 0 ? `Còn ${p.quantity}` : "⚠️ Hết hàng";
  const price = Number(p.price).toLocaleString("vi-VN");
  return `${index + 1}. **${p.name}** | ${price}đ | ${p.category || "N/A"} > ${p.subCategory || "N/A"} | Size: ${sizes} | ${stock} | [Xem sản phẩm](${link}) __ID:${p._id}__`;
};

const stripIds = (text) => text.replace(/\s*__ID:[a-f\d]{24}__/gi, "");

// ── Session helpers ───────────────────────────────────────────────────────────
const getOrCreateSession = async (userId) => {
  let session = await chatModel.findOne({ userId });
  if (!session) {
    session = await new chatModel({
      userId,
      messages: [],
      productCache: {},
      userPrefs: {},
    }).save();
  }
  return session;
};

const updateSessionCache = (session, products) => {
  if (!session.productCache) session.productCache = {};
  for (const p of products) {
    session.productCache[p._id.toString()] = {
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      subCategory: p.subCategory,
      sizes: p.sizes,
      quantity: p.quantity,
      image: p.image,
    };
  }
};

const updateUserPrefs = (session, extractedPrefs) => {
  if (!extractedPrefs || typeof extractedPrefs !== "object") return;
  if (!session.userPrefs) session.userPrefs = {};
  for (const [key, val] of Object.entries(extractedPrefs)) {
    if (val !== null && val !== undefined) {
      session.userPrefs[key] = val;
    }
  }
};

const buildProductContext = (session) => {
  const cache = session.productCache || {};
  const entries = Object.values(cache).slice(-6);
  if (!entries.length) return null;
  return entries
    .map((p) => {
      const price = Number(p.price).toLocaleString("vi-VN");
      return `• ${p.name} (${price}đ, Size: ${(p.sizes || []).join("/")}) __ID:${p._id}__`;
    })
    .join("\n");
};

const buildUserPrefsContext = (session) => {
  const prefs = session.userPrefs || {};
  if (!Object.keys(prefs).length) return null;
  return Object.entries(prefs)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
};

// ── LLM call ─────────────────────────────────────────────────────────────────
const callLLM = async (systemPrompt, messages, maxTokens = 1024) => {
  const res = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
    temperature: 0.3,
  });
  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return {
      action: "reply",
      message: "Mình chưa hiểu ý bạn lắm. Bạn muốn tìm sản phẩm gì?",
    };
  }
};

// ── Build reply with product list ─────────────────────────────────────────────
const buildReplyWithProducts = async (
  session,
  history,
  userMessage,
  products,
  intent,
  upsellQuery = null,
) => {
  const productList = products.map(formatProduct).join("\n");

  const prefs = session.userPrefs || {};
  const prefsSummary = Object.entries(prefs)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const personalizeHint = prefsSummary
    ? `\n[THÔNG TIN USER: ${prefsSummary}] → gợi ý phù hợp, KHÔNG hỏi lại thứ đã biết`
    : `\n[CHƯA BIẾT THÔNG TIN USER] → sau khi liệt kê hỏi: 1) đồ nam/nữ/trẻ em 2) dịp mặc 3) ngân sách`;

  const upsellHint = upsellQuery
    ? `\n[UPSELL: Sau khi liệt kê, gợi ý thêm "${upsellQuery}" để phối đồ]`
    : "";

  const systemPrompt = `Bạn là trợ lý mua sắm thân thiện, chủ động tư vấn. Trả về JSON: {"message":"..."}.
Dữ liệu sản phẩm là THẬT từ database — chỉ dùng dữ liệu này, KHÔNG bịa thêm.
QUY TẮC:
- KHÔNG hiển thị __ID:xxx__
- Giữ nguyên link [Xem sản phẩm](...)
- Mỗi sản phẩm: tên in đậm, giá, size, tình trạng kho, link
- Hỏi tối đa 1-2 câu sau khi liệt kê, đúng thứ còn thiếu${personalizeHint}${upsellHint}`;

  const reply = await callLLM(systemPrompt, [
    ...history,
    { role: "user", content: userMessage },
    { role: "user", content: `[DATABASE]\n${productList}` },
  ]);

  return reply.message || productList;
};

// ── Main handler ──────────────────────────────────────────────────────────────
export const sendMessage = async (userId, userMessage, authHeader) => {
  const session = await getOrCreateSession(userId);

  // Normalize Vietnamese
  const normalizedMessage = normalizeVietnamese(userMessage);
  const inputForLLM =
    normalizedMessage !== userMessage.toLowerCase()
      ? `${userMessage} [normalized: ${normalizedMessage}]`
      : userMessage;

  const history = session.messages.slice(-HISTORY_LIMIT).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const productContext = buildProductContext(session);
  const userPrefsContext = buildUserPrefsContext(session);

  // Single LLM call — intent detection
  const intent = await callLLM(
    buildMasterPrompt(productContext, userPrefsContext),
    [...history, { role: "user", content: inputForLLM }],
    768,
  );
  console.log("[Intent]", JSON.stringify(intent));

  // Persist extracted preferences
  if (intent.extractedPrefs) {
    updateUserPrefs(session, intent.extractedPrefs);
  }

  let assistantMessage = "";

  switch (intent.action) {
    case "search":
    case "refine_search": {
      const query =
        intent.action === "refine_search" ? intent.refineQuery : intent.query;
      const products = await searchProducts(query);
      updateSessionCache(session, products);

      if (!products.length) {
        // Fallback: broader query (first word only)
        const broadQuery = query.split(" ")[0];
        const fallback = await searchProducts(broadQuery);
        if (fallback.length) {
          updateSessionCache(session, fallback);
          const upsell = UPSELL_RULES[broadQuery]?.[0] ?? null;
          assistantMessage = await buildReplyWithProducts(
            session,
            history,
            userMessage,
            fallback,
            intent,
            upsell,
          );
          assistantMessage =
            `Không tìm thấy "${query}" chính xác, nhưng mình tìm được:\n\n` +
            assistantMessage;
        } else {
          assistantMessage = `Rất tiếc, mình không tìm thấy "${query}". Bạn thử tìm áo thun, quần jean, hay giày không?`;
        }
      } else {
        const upsell = UPSELL_RULES[intent.query]?.[0] ?? null;
        assistantMessage = await buildReplyWithProducts(
          session,
          history,
          userMessage,
          products,
          intent,
          upsell,
        );
      }
      break;
    }

    case "compare": {
      const ids = intent.compareIds || [];
      const cache = session.productCache || {};
      const toCompare = ids.map((id) => cache[id]).filter(Boolean);

      if (toCompare.length < 2) {
        assistantMessage =
          "Bạn muốn so sánh sản phẩm nào? Cho mình biết tên hoặc chọn từ các sản phẩm đã xem nhé!";
      } else {
        const compareData = toCompare
          .map((p, i) => formatProduct(p, i))
          .join("\n");
        const reply = await callLLM(
          `So sánh các sản phẩm theo bảng: tên, giá, size, phong cách phù hợp. Trả về JSON {"message":"..."}`,
          [
            {
              role: "user",
              content: `[So sánh]\n${compareData}\nUser hỏi: ${userMessage}`,
            },
          ],
        );
        assistantMessage = reply.message || "Mình không thể so sánh lúc này.";
      }
      break;
    }

    case "get_orders": {
      const orders = await fetchUserOrders(authHeader);
      if (!orders.length) {
        assistantMessage =
          "Bạn chưa có đơn hàng nào. Muốn mình giúp tìm sản phẩm phù hợp không?";
      } else {
        const orderList = orders
          .map((o, i) => {
            const items = o.items
              .map((it) => `${it.name} x${it.quantity} (${it.size})`)
              .join(", ");
            const date = new Date(o.date).toLocaleDateString("vi-VN");
            return `**Đơn ${i + 1}**: ${items} | ${Number(o.amount).toLocaleString("vi-VN")}đ | ${o.status} | ${date}`;
          })
          .join("\n");
        assistantMessage = `Đây là ${orders.length} đơn hàng của bạn:\n\n${orderList}\n\nBạn cần hỗ trợ về đơn nào không?`;
      }
      break;
    }

    case "place_order": {
      const { items = [], firstName, lastName, street, city, phone } = intent;
      const invalidIds = items.filter(
        (i) => !/^[a-f\d]{24}$/i.test(i.productId),
      );

      if (invalidIds.length) {
        assistantMessage =
          "❌ Vui lòng tìm và chọn sản phẩm trước để mình đặt hàng chính xác nhé!";
        break;
      }

      const cache = session.productCache || {};
      const enriched = items.map((item) => ({
        ...item,
        image: item.image || cache[item.productId]?.image || [],
        name: item.name || cache[item.productId]?.name || "Sản phẩm",
      }));

      const subtotal = enriched.reduce((s, i) => s + i.price * i.quantity, 0);
      const shipping = 10;
      const amount = subtotal + shipping;

      const result = await placeOrderCOD({
        items: enriched,
        amount,
        address: { firstName, lastName, street, city, phone },
        authHeader,
      });

      if (result?.success) {
        const itemSummary = enriched
          .map((i) => `${i.name} x${i.quantity} (${i.size})`)
          .join(", ");
        assistantMessage = `✅ **Đặt hàng thành công!**\n📦 ${itemSummary}\n💰 Tổng: ${Number(amount).toLocaleString("vi-VN")}đ (gồm ${shipping}$ ship)\n🚚 Thanh toán khi nhận hàng.\n\nBạn muốn tìm thêm sản phẩm phối đồ không?`;
      } else {
        assistantMessage = `❌ Đặt hàng thất bại: ${result?.message || "Lỗi không xác định"}. Bạn thử lại nhé!`;
      }
      break;
    }

    default:
      assistantMessage =
        intent.message ||
        "Mình có thể giúp bạn tìm áo, quần, giày hay phụ kiện. Bạn đang cần gì?";
  }

  if (!assistantMessage) {
    assistantMessage =
      "Xin lỗi, mình không thể xử lý yêu cầu này. Bạn thử hỏi lại nhé!";
  }

  const clean = stripIds(assistantMessage);

  session.messages.push({ role: "user", content: userMessage });
  session.messages.push({ role: "assistant", content: clean });
  session.updatedAt = new Date();

  // Trim to prevent DB bloat
  if (session.messages.length > 50) {
    session.messages = session.messages.slice(-50);
  }

  await session.save();
  return { message: clean, sessionId: session._id };
};

export const getChatHistory = async (userId) => {
  const session = await chatModel.findOne({ userId });
  return session ? session.messages : [];
};

export const clearChatHistory = async (userId) => {
  await chatModel.findOneAndUpdate(
    { userId },
    { messages: [], productCache: {}, userPrefs: {}, updatedAt: new Date() },
  );
};

export const getWelcomeMessage = () => ({
  role: "assistant",
  content:
    "Xin chào! Mình là trợ lý mua sắm 👗✨\n\nĐể tư vấn chuẩn hơn cho bạn — bạn đang tìm **đồ nam hay nữ**? Và thường mặc phong cách gì (casual, công sở, street, thể thao...)?",
});
