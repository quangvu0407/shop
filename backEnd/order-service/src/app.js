import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"

import orderRouter from "./routes/orderRoute.js"

const app = express()
const port = process.env.PORT || 3003

app.use(express.json())
app.use(cors())

app.use('/', orderRouter)

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("Order service running on " + port);
    });
  } catch (error) {
    console.error("Failed to start order service:", error);
    process.exit(1);
  }
};

startServer();