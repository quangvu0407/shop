import {
  createOrderCOD,
  createOrderStripe,
  verifyStripePayment,
  getAllOrders,
  getUserOrders,
  changeOrderStatus,
} from "../services/orderService.js";

// Đặt đơn COD
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;

    await createOrderCOD({
      userId,
      items,
      amount,
      address,
      authHeader: req.headers.authorization,
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

    const { newOrder, sessionUrl } = await createOrderStripe({ userId, items, amount, address, origin });

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