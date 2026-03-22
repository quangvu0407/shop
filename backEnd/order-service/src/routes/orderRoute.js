import express from 'express'
import { placeOrder, placeOrderStripe, userOrders, allOrders, updateStatus, verifyStripe, stats, recent} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

//admin
orderRouter.post('/list',adminAuth, allOrders)
orderRouter.post('/status',adminAuth, updateStatus)

//thanh toán
orderRouter.post('/place',authUser, placeOrder)
orderRouter.post('/stripe',authUser, placeOrderStripe)
// orderRouter.post('/vnpay',authUser, placeOrderVnpay)

//Người dùng
orderRouter.post('/userorders', authUser, userOrders)

// Xác thực thanh toán thành công/thất bại
orderRouter.post('/verifyStripe', authUser, verifyStripe)

//data dashboard
orderRouter.get("/stats", stats);
orderRouter.get("/recent", recent);

export default orderRouter