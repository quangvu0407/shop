import {
  createOrderCOD,
  createOrderStripe,
  verifyStripePayment,
  getAllOrders,
  getUserOrders,
  changeOrderStatus,
  getOrderStats,
  getRecentOrders,
  cancelUserOrder,
  deleteOrderUser,
  deleteCancelledOrder,
} from "../services/orderService.js";

// Đặt đơn COD
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address, promoIds } = req.body;

    await createOrderCOD({
      userId,
      items,
      amount,
      address,
      authHeader: req.headers.authorization,
      promoIds,
    });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Đặt đơn qua Stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    const { newOrder, sessionUrl } = await createOrderStripe({
      userId,
      items,
      amount,
      address,
      origin,
    });

    res.json({ success: true, session_url: sessionUrl });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
export const verifyStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, success } = req.body;

    const result = await verifyStripePayment({
      userId,
      orderId,
      success,
      authHeader: req.headers.authorization,
    });

    res.json({ success: result });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Lấy tất cả đơn hàng
export const allOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Lấy đơn hàng của user
export const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getUserOrders(userId);
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update trạng thái đơn hàng
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await changeOrderStatus({ orderId, status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    await deleteOrderUser(orderId);
    res.json({ success: true, message: "delete success" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const stats = async (req, res) => {
  try {
    const data = await getOrderStats();

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get stats",
    });
  }
};

export const recent = async (req, res) => {
  try {
    const orders = await getRecentOrders();

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Recent orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get recent orders",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;
    await cancelUserOrder({ orderId, userId });
    res.json({ success: true, message: "Đơn hàng đã được hủy" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const deleteMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;
    await deleteCancelledOrder({ orderId, userId });
    res.json({ success: true, message: "Đã xóa đơn hàng" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
