import axios from "axios";

const productBase = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const cartBase = process.env.CART_SERVICE_URL || "http://localhost:3004";
const promotionBase = process.env.PROMOTION_SERVICE_URL || "http://localhost:3007";

function rethrowWithMessage(err, fallback) {
  const msg = err.response?.data?.message || (err instanceof Error ? err.message : null) || fallback;
  throw new Error(msg);
}

export async function decreaseStockRemote(items) {
  try {
    console.log("[decreaseStock] calling", productBase, "items:", JSON.stringify(items));
    const { data } = await axios.post(`${productBase}/stock/decrease`, { items });
    console.log("[decreaseStock] response:", JSON.stringify(data));
    if (!data?.success) {
      throw new Error(data?.message || "Stock decrease failed");
    }
  } catch (err) {
    rethrowWithMessage(err, "Stock decrease failed");
  }
}

export async function restoreStockRemote(items) {
  try {
    const { data } = await axios.post(`${productBase}/stock/restore`, { items });
    if (!data?.success) {
      throw new Error(data?.message || "Stock restore failed");
    }
  } catch (err) {
    rethrowWithMessage(err, "Stock restore failed");
  }
}

export async function clearCartRemote(authHeader) {
  if (!authHeader) {
    throw new Error("Missing authorization for cart");
  }
  try {
    const { data } = await axios.post(
      `${cartBase}/clear`,
      {},
      { headers: { Authorization: authHeader } }
    );
    if (!data?.success) {
      throw new Error(data?.message || "Clear cart failed");
    }
  } catch (err) {
    rethrowWithMessage(err, "Clear cart failed");
  }
}

export async function confirmPromoUsage(promoIds, userId) {
  if (!promoIds || promoIds.length === 0) return;
  for (const promoId of promoIds) {
    try {
      await axios.post(`${promotionBase}/confirm-usage`, { promoId, userId: String(userId) });
    } catch (err) {
      console.error("[confirmPromoUsage] failed for", promoId, err.message);
    }
  }
}
