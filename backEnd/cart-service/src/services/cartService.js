import redis from "../config/redis.js";

const CART_TTL = 60 * 60 * 24 * 7; // 7 ngày

const getCartKey = (userId) => `cart:${userId}`;

const getCart = async (userId) => {
    try {
        const data = await redis.get(getCartKey(userId));
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Redis get cart error:", e);
        return [];
    }
};

const saveCart = async (userId, items) => {
    try {
        await redis.set(getCartKey(userId), JSON.stringify(items), "EX", CART_TTL);
    } catch (e) {
        console.error("Redis set cart error:", e);
    }
};

// 1. Thêm vào giỏ
export const addToCartService = async (userId, { itemId, size }) => {
    const items = await getCart(userId);

    const idx = items.findIndex(
        (item) => item.productId === itemId && item.size === size
    );

    if (idx > -1) {
        items[idx].quantity += 1;
    } else {
        items.push({ productId: itemId, size, quantity: 1 });
    }

    await saveCart(userId, items);
    return items;
};

// 2. Cập nhật số lượng (quantity = 0 thì xóa)
export const updateCartService = async (userId, { itemId, size, quantity }) => {
    const items = await getCart(userId);

    const idx = items.findIndex(
        (item) => item.productId === itemId && item.size === size
    );

    if (idx === -1) throw new Error("Item not found in cart");

    if (quantity > 0) {
        items[idx].quantity = quantity;
    } else {
        items.splice(idx, 1);
    }

    await saveCart(userId, items);
    return items;
};

// 3. Lấy giỏ hàng
export const getUserCartService = async (userId) => {
    return await getCart(userId);
};

// 4. Xóa toàn bộ giỏ
export const clearUserCartService = async (userId) => {
    try {
        await redis.del(getCartKey(userId));
    } catch (e) {
        console.error("Redis del cart error:", e);
    }
};
