import axios from "axios";

const productBase = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const cartBase = process.env.CART_SERVICE_URL || "http://localhost:3004";

function rethrowWithMessage(err, fallback) {
  const msg = err.response?.data?.message || (err instanceof Error ? err.message : null) || fallback;
  throw new Error(msg);
}

export async function decreaseStockRemote(items) {
  try {
    const { data } = await axios.post(`${productBase}/stock/decrease`, { items });
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
