import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"

import productRouter from "./routes/productRoute.js"

const app = express()
const port = process.env.PORT || 3002

app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  next();
});
app.use('/', productRouter)

const startServer = async () => {
  try {
    await connectDB();
    connectCloudinary();
    app.listen(port, () => {
      console.log("Product service running on " + port);
    });
  } catch (error) {
    console.error("Failed to start product service:", error);
    process.exit(1);
  }
};

startServer();