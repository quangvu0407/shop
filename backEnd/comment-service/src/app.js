import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import commentRouter from "./routes/commentRoute.js";

const app = express();
const port = process.env.PORT || 3006;

app.use(express.json());
app.use(cors());

app.use("/api/comment", commentRouter);
app.use("/", commentRouter);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("Comment service running on " + port);
    });
  } catch (error) {
    console.error("Failed to start comment service:", error);
    process.exit(1);
  }
};

startServer();
