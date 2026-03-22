import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"

import cartRouter from "./routes/cartRoute.js"

const app = express()
const port = process.env.PORT || 3004

app.use(express.json())
app.use(cors())

app.use('/', cartRouter)

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("Cart service running on " + port);
    });
  } catch (error) {
    console.error("Failed to start cart service:", error);
    process.exit(1);
  }
};

startServer();