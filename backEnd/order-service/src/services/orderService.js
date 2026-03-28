import orderModel from "../models/orderModel.js";
import Stripe from "stripe";
import {
  decreaseStockRemote,
  restoreStockRemote,
  clearCartRemote,
} from "../utils/internalClients.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = "usd";
const deliveryCharge = 10;
const toStripeCents = (value) => Math.round(Number(value) * 100);

export const createOrderCOD = async ({
  userId,
  items,
  amount,
  address,
  authHeader,
}) => {
  await decreaseStockRemote(items);

  const orderData = {
    userId,
    items,
    address,
    amount,
    paymentMethod: "COD",
    payment: false,
    date: Date.now(),
  };

  const newOrder = new orderModel(orderData);
  try {
    await newOrder.save();
  } catch (err) {
    await restoreStockRemote(items);
    throw err;
  }

  try {
    await clearCartRemote(authHeader);
  } catch (clearErr) {
    console.error("Clear cart after COD order failed:", clearErr);
    throw clearErr;
  }

  return newOrder;
};

export const createOrderStripe = async ({
  userId,
  items,
  amount,
  address,
  origin,
}) => {
  const orderData = {
    userId,
    items,
    address,
    amount,
    paymentMethod: "Stripe",
    payment: false,
    date: Date.now(),
  };

  const newOrder = new orderModel(orderData);
  await newOrder.save();

  const line_items = items.map((item) => ({
    price_data: {
      currency,
      product_data: { name: item.name },
      unit_amount: toStripeCents(item.price),
    },
    quantity: item.quantity,
  }));

  line_items.push({
    price_data: {
      currency,
      product_data: { name: "Delivery Charges" },
      unit_amount: toStripeCents(deliveryCharge),
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
    cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
    line_items,
    mode: "payment",
  });

  return { newOrder, sessionUrl: session.url };
};

export const verifyStripePayment = async ({
  userId,
  orderId,
  success,
  authHeader,
}) => {
  if (success === "true") {
    const order = await orderModel.findOneAndUpdate(
      { _id: orderId, userId: String(userId), payment: false },
      { $set: { payment: true } },
      { new: true },
    );

    if (!order) {
      const existing = await orderModel.findById(orderId);
      if (
        existing &&
        String(existing.userId) === String(userId) &&
        existing.payment
      ) {
        try {
          await clearCartRemote(authHeader);
        } catch {
          /* retry path: cart may already be empty */
        }
        return true;
      }
      throw new Error("Order not found or already processed");
    }

    try {
      await decreaseStockRemote(order.items);
    } catch (err) {
      await orderModel.findByIdAndUpdate(orderId, { payment: false });
      throw err;
    }

    try {
      await clearCartRemote(authHeader);
    } catch (clearErr) {
      console.error("Clear cart after Stripe verify failed:", clearErr);
      throw clearErr;
    }

    return true;
  }

  await orderModel.findByIdAndDelete(orderId);
  return false;
};

export const getAllOrders = async () => {
  return await orderModel.find({});
};

export const getUserOrders = async (userId) => {
  return await orderModel.find({ userId });
};

export const changeOrderStatus = async ({ orderId, status }) => {
  if (status === "Cancelled") {
    const order = await orderModel.findById(orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    if (order.status !== "Cancelled") {
      await restoreStockRemote(order.items);
    }
  }
  await orderModel.findByIdAndUpdate(orderId, { status });
  return true;
};

export const deleteOrderUser = async (orderId) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  // Restore stock nếu đơn chưa bị hủy và đã giảm stock (COD hoặc Stripe đã thanh toán)
  const shouldRestore = order.status !== "Cancelled" && order.status !== "Order Placed" ||
    (order.status === "Order Placed" && order.paymentMethod === "COD") ||
    (order.paymentMethod === "Stripe" && order.payment === true);

  if (order.status !== "Cancelled" && (order.paymentMethod === "COD" || order.payment === true)) {
    try { await restoreStockRemote(order.items); } catch { /* best effort */ }
  }

  return await orderModel.findByIdAndDelete(orderId);
};

export const getOrderStats = async () => {
  const orders = await orderModel.find({});

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return {
    totalRevenue,
    orderCount: orders.length,
  };
};

export const getRecentOrders = async () => {
  const orders = await orderModel.find({}).sort({ date: -1 }).limit(5);

  return orders;
};

export const cancelUserOrder = async ({ orderId, userId }) => {
  const order = await orderModel.findOne({
    _id: orderId,
    userId: String(userId),
  });

  if (!order) throw new Error("Không tìm thấy đơn hàng");
  if (order.status !== "Order Placed")
    throw new Error(
      "Không thể hủy đơn hàng đang vận chuyển hoặc đã hoàn thành",
    );

  await restoreStockRemote(order.items);
  await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled" });

  return true;
};

export const deleteCancelledOrder = async ({ orderId, userId }) => {
  const order = await orderModel.findOne({ _id: orderId, userId: String(userId) });
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  if (order.status !== "Cancelled") throw new Error("Chỉ có thể xóa đơn hàng đã hủy");
  return await orderModel.findByIdAndDelete(orderId);
};
