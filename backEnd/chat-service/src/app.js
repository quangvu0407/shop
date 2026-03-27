import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"

import chatRouter from "./routes/chatRoute.js"

const app = express()
const port = process.env.PORT || 3005

app.use(express.json())
app.use(cors())

app.use('/', chatRouter)

const startServer = async () => {
  try {
    await connectDB();
    connectCloudinary();
    app.listen(port, () => {
      console.log("Chat service running on " + port);
    });
  } catch (error) {
    console.error("Failed to start chat service:", error);
    process.exit(1);
  }
};

startServer();