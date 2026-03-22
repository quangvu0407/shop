import express from "express"
import axios from "axios"
import cors from "cors"

const app = express()

app.use(cors());
app.use(express.json())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const proxy = (url) => async (req, res) => {
  console.log(`FE gửi sang: ${req.originalUrl} -> Gateway chuyển tiếp: ${url}${req.url}`);
  try {
    const response = await axios({
      method: req.method,
      url: `${url}${req.url}`,
      data: req.body,
      headers: req.headers
    })
    res.json(response.data)
  } catch (err) {
    // Retry once for transient network errors while downstream service is restarting.
    if (!err.response && req.method === "GET") {
      try {
        await sleep(200);
        const retryResponse = await axios({
          method: req.method,
          url: `${url}${req.url}`,
          headers: req.headers
        });
        return res.json(retryResponse.data);
      } catch (retryErr) {
        console.error("Lỗi Service (retry):", retryErr.response?.data || retryErr.message);
        if (retryErr.response) {
          return res.status(retryErr.response.status).json(retryErr.response.data);
        }
        return res.status(503).json({ error: "Service unavailable", detail: retryErr.message });
      }
    }

    console.error("Lỗi Service:", err.response?.data || err.message);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(503).json({ error: 'Service unavailable', detail: err.message });
  }
}

app.use('/api/user', proxy('http://localhost:3001'))
app.use('/api/admin', proxy('http://localhost:3001'))

app.use('/api/product', proxy('http://localhost:3002'))
app.use('/api/cart', proxy('http://localhost:3004'))
app.use('/api/order', proxy('http://localhost:3003'))
app.use('/api/chat', proxy('http://localhost:3005'))
app.use('/api/comment', proxy('http://localhost:3006'))

app.listen(3000, () => {
  console.log('Gateway running on 3000')
})