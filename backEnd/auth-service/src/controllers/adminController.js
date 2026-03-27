import axios from "axios";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

// API lấy thống kê tổng quan cho Dashboard
const getDashboardStats = async (req, res) => {
  try {

    // gọi song song qua gateway
    const config = {
      headers: {
        Authorization: req.headers.authorization
      }
    };
    console.log(req.headers.authorization);
    const [
      orderStatsRes,
      productCountRes,
      userCountRes,
      recentOrdersRes
    ] = await Promise.all([
      axios.get(`${GATEWAY_URL}/api/order/stats`, config),
      axios.get(`${GATEWAY_URL}/api/product/count`, config),
      axios.get(`${GATEWAY_URL}/api/user/count`, config),
      axios.get(`${GATEWAY_URL}/api/order/recent`, config)
    ]);

    const totalRevenue = orderStatsRes.data.totalRevenue;
    const orderCount = orderStatsRes.data.orderCount;
    const productCount = productCountRes.data.productCount;
    const userCount = userCountRes.data.userCount;
    const recentOrders = recentOrdersRes.data.orders;

    res.json({
      success: true,
      data: {
        totalRevenue,
        orderCount,
        productCount,
        userCount,
        recentOrders
      }
    });

  } catch (error) {
    console.log("FULL ERROR:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({
      success: false,
      message: "Dashboard service error",
      detail: error.response?.data || error.message
    });
  }
};

export { getDashboardStats };