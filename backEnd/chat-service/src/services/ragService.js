import axios from "axios";

const GATEWAY = process.env.PRODUCT_API || "http://localhost:3000/api";


// Lấy đơn hàng của user
export const fetchUserOrders = async (authHeader) => {
  try {
    const res = await axios.post(
      `${GATEWAY}/order/userorders`,
      {},
      { headers: { Authorization: authHeader } }
    );
    if (res.data?.success) return res.data.orders || [];
    return [];
  } catch {
    return [];
  }
};

// Đặt đơn COD
export const placeOrderCOD = async ({ items, amount, address, authHeader }) => {
  try {
    const res = await axios.post(
      `${GATEWAY}/order/place`,
      { items, amount, address },
      { headers: { Authorization: authHeader } }
    );
    return res.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// Tìm sản phẩm theo tên/category/giá
export const searchProducts = async (query) => {
  try {
    const res = await axios.get(`${GATEWAY}/product/list`);
    if (!res.data?.success) return [];

    const products = res.data.products || [];
    const q = query.toLowerCase().trim();
    const qNorm = q.replace(/[-_]/g, " ").replace(/\s+/g, " ");

    // Alias mapping cho các từ viết tắt phổ biến
    const ALIASES = {
      "tshirt": ["t shirt", "tee"],
      "tee": ["t shirt"],
      "trouser": ["pant"],
      "pant": ["trouser"],
    };
    const aliasWords = ALIASES[qNorm] || [];

    const words = qNorm.split(" ").filter(Boolean);
    console.log("[Search] query:", q, "| normalized:", qNorm, "| words:", words, "| total:", products.length);

    const normalize = (str) => str.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");

    const priceMatch = q.match(/(\d[\d.,]*)\s*k?\b/);
    const priceLimit = priceMatch
      ? parseFloat(priceMatch[1].replace(/,/g, "")) * (q.includes("k") ? 1000 : 1)
      : null;
    const isUnder = q.includes("dưới") || q.includes("under") || q.includes("<");
    const isOver = q.includes("trên") || q.includes("over") || q.includes(">");

    const results = products
      .filter(p => {
        const name = normalize(p.name);
        const cat = normalize(p.category);
        const sub = normalize(p.subCategory || "");

        if (priceLimit) {
          if (isUnder) return p.price <= priceLimit;
          if (isOver) return p.price >= priceLimit;
        }

        const exactMatch = name.includes(qNorm) || cat.includes(qNorm) || sub.includes(qNorm);
        const wordMatch = words.some(w => name.includes(w) || cat.includes(w) || sub.includes(w));
        const aliasMatch = aliasWords.some(a => name.includes(a) || cat.includes(a) || sub.includes(a));
        return exactMatch || wordMatch || aliasMatch;
      })
      .slice(0, 8);

    console.log("[Search] results:", results.map(p => p.name));
    return results;
  } catch (err) {
    console.error("[Search] error:", err.message);
    return [];
  }
};
