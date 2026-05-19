import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"

import orderRouter from "./routes/orderRoute.js"
import { stripeWebhook } from "./controllers/orderController.js"
import { cleanupPendingStripeOrders } from "./services/orderService.js"

const app = express()
const port = process.env.PORT || 3003

// Webhook phải đứng TRƯỚC express.json() vì cần raw body
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json())
app.use(cors())

app.use('/', orderRouter)

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("Order service running on " + port);
    });

    // Cleanup order Stripe bị treo mỗi giờ
    setInterval(cleanupPendingStripeOrders, 60 * 60 * 1000);
  } catch (error) {
    console.error("Failed to start order service:", error);
    process.exit(1);
  }
};

startServer();