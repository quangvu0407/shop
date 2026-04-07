import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import promotionRouter from "./routes/promotionRoute.js";

const app = express();
const port = process.env.PORT || 3007;

app.use(express.json());
app.use(cors());

app.use("/", promotionRouter);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("Promotion service running on " + port);
    });
  } catch (error) {
    console.error("Failed to start promotion service:", error);
    process.exit(1);
  }
};

startServer();
