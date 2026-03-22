import * as cartService from "../services/cartService.js";

const addToCart = async (req, res) => {
    try {
        await cartService.addToCartService(req.user.id, req.body);
        res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCart = async (req, res) => {
    try {
        await cartService.updateCartService(req.user.id, req.body);
        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserCart = async (req, res) => {
    try {
        const cartItems = await cartService.getUserCartService(req.user.id);
        res.json({ success: true, cartData: cartItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const clearMyCart = async (req, res) => {
    try {
        await cartService.clearUserCartService(req.user.id);
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart, clearMyCart };