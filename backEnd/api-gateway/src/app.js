import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(cors());

// Dùng env var để switch giữa local và Docker
const SERVICES = {
  auth: process.env.AUTH_URL || "http://localhost:3001",
  product: process.env.PRODUCT_URL || "http://localhost:3002",
  order: process.env.ORDER_URL || "http://localhost:3003",
  cart: process.env.CART_URL || "http://localhost:3004",
  chat: process.env.CHAT_URL || "http://localhost:3005",
  comment: process.env.COMMENT_URL || "http://localhost:3006",
  promotion: process.env.PROMOTION_URL || "http://localhost:3007",
};

const proxy = (target, prefix) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: (path) => {
    const newPath = path.replace(prefix, "") || "/";
    console.log(`[Gateway] ${prefix}${path} -> ${target}${newPath}`);
    return newPath;
  },
  on: {
    error: (err, req, res) => {
      console.error(`[Gateway] Error -> ${target}:`, err.message);
      res.status(503).json({ error: "Service unavailable", detail: err.message });
    }
  }
});

app.use("/api/user", proxy(SERVICES.auth, "/api/user"));
app.use("/api/admin", proxy(SERVICES.auth, "/api/admin"));
app.use("/api/product", proxy(SERVICES.product, "/api/product"));
app.use("/api/order", proxy(SERVICES.order, "/api/order"));
app.use("/api/cart", proxy(SERVICES.cart, "/api/cart"));
app.use("/api/chat", proxy(SERVICES.chat, "/api/chat"));
app.use("/api/comment", proxy(SERVICES.comment, "/api/comment"));
app.use("/api/promotion", proxy(SERVICES.promotion, "/api/promotion"));

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});
