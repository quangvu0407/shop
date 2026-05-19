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

// Tìm sản phẩm theo keyword + category + giá tùy chọn
export const searchProducts = async (query, { category, subCategory, minPrice, maxPrice } = {}) => {
  try {
    const params = { search: query, limit: 8, page: 1 };
    if (category) params.category = category;
    if (subCategory) params.subCategory = subCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    const res = await axios.get(`${GATEWAY}/product/listpage`, { params });
    if (!res.data?.success) return [];
    const products = res.data.data || [];
    console.log("[Search] query:", query, "| category:", category, "| price:", minPrice, "-", maxPrice, "| results:", products.map(p => p.name));
    return products;
  } catch (err) {
    console.error("[Search] error:", err.message);
    return [];
  }
};
