import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  userOrders,
  allOrders,
  updateStatus,
  verifyStripe,
  stats,
  recent,
  cancelOrder,
  deleteOrder,
  deleteMyOrder,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

//admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

//thanh toán
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
// orderRouter.post('/vnpay',authUser, placeOrderVnpay)

//Người dùng
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/cancel", authUser, cancelOrder);
orderRouter.post("/delete-cancelled", authUser, deleteMyOrder);
orderRouter.post("/delete", adminAuth, deleteOrder);

// Xác thực thanh toán thành công/thất bại
orderRouter.post("/verifyStripe", authUser, verifyStripe);

//data dashboard
orderRouter.get("/stats", stats);
orderRouter.get("/recent", recent);

export default orderRouter;
