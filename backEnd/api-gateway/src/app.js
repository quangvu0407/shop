import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors());

// LƯU Ý: Không dùng express.json() TRƯỚC proxy nếu bạn muốn chuyển tiếp các request POST/PUT 
// có body (như thêm sản phẩm). Nếu cần dùng, phải thêm logic "fixRequestBody".
// Ở đây mình để mặc định để proxy tự xử lý stream body hiệu quả nhất.

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Log để bạn dễ theo dõi giống
    console.log(`FE gửi: ${req.originalUrl} -> Gateway chuyển tiếp: ${target}${path}`);
    return path; 
  },
  // Xử lý lỗi và retry (thay thế cho hàm sleep/retry thủ công của bạn)
  onError: (err, req, res) => {
    console.error(`Lỗi Service tại ${target}:`, err.message);
    res.status(503).json({ error: "Service unavailable", detail: err.message });
  },
  // Nếu bạn vẫn cần dùng express.json() ở phía trên, hãy uncomment đoạn dưới này:
  /*
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
  */
});

// Cấu hình các route
app.use('/api/user', createProxyMiddleware(proxyOptions('http://localhost:3001')));
app.use('/api/admin', createProxyMiddleware(proxyOptions('http://localhost:3001')));
app.use('/api/product', createProxyMiddleware(proxyOptions('http://localhost:3002')));
app.use('/api/order', createProxyMiddleware(proxyOptions('http://localhost:3003')));
app.use('/api/cart', createProxyMiddleware(proxyOptions('http://localhost:3004')));
app.use('/api/chat', createProxyMiddleware(proxyOptions('http://localhost:3005')));
app.use('/api/comment', createProxyMiddleware(proxyOptions('http://localhost:3006')));

app.listen(3000, () => {
  console.log('🚀 API Gateway running on port 3000');
});