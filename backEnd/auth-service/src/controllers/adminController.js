import axios from "axios";

// API lấy thống kê tổng quan cho Dashboard
const getDashboardStats = async (req, res) => {
  try {

    // gọi song song qua gateway
    const config = {
      headers: {
        Authorization: req.headers.authorization
      }
    };

    const [
      orderStatsRes,
      productCountRes,
      userCountRes,
      recentOrdersRes
    ] = await Promise.all([
      axios.get("http://localhost:3000/api/order/stats", config),
      axios.get("http://localhost:3000/api/product/count", config),
      axios.get("http://localhost:3000/api/user/count", config),
      axios.get("http://localhost:3000/api/order/recent", config)
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
    console.log("Lỗi Dashboard Stats:", error.message);

    res.status(500).json({
      success: false,
      message: "Dashboard service error",
      detail: error.message
    });
  }
};

export { getDashboardStats };