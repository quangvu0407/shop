import cartModel from "../models/cartModel.js";

// 1. Logic thêm vào giỏ
export const addToCartService = async (userId, { itemId, size }) => {
    let cart = await cartModel.findOne({ userId });

    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
        cart = new cartModel({
            userId,
            items: [{ productId: itemId, size, quantity: 1 }]
        });
    } else {
        // Tìm xem sản phẩm cùng size đã có trong giỏ chưa
        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === itemId && item.size === size
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1; // Có rồi thì cộng 1
        } else {
            cart.items.push({ productId: itemId, size, quantity: 1 }); // Chưa có thì push mới
        }
    }   
    return await cart.save();
};

// 2. Logic cập nhật số lượng (hoặc xóa)
export const updateCartService = async (userId, { itemId, size, quantity }) => {
    let cart = await cartModel.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === itemId && item.size === size
    );

    if (itemIndex > -1) {
        if (quantity > 0) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Nếu quantity = 0 thì xóa dòng đó luôn
            cart.items.splice(itemIndex, 1);
        }
        return await cart.save();
    } else {
        throw new Error("Item not found in cart");
    }
};

// 3. Logic lấy giỏ hàng
export const getUserCartService = async (userId) => {
    // cart-service does not own the product model, so avoid populate here.
    const cart = await cartModel.findOne({ userId });
    return cart ? cart.items : [];
};

export const clearUserCartService = async (userId) => {
    const cart = await cartModel.findOne({ userId });
    if (!cart) return null;
    cart.items = [];
    return await cart.save();
};