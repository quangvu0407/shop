import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// API lấy thống kê tổng quan cho Dashboard
const getDashboardStats = async (req, res) => {
    try {
        // 1. Tính tổng doanh thu (Sum của tất cả trường amount trong orders)
        // Lưu ý: Bạn có thể lọc thêm { status: { $ne: 'Cancelled' } } nếu không muốn tính đơn hủy
        const orders = await orderModel.find({});
        const totalRevenue = orders.reduce((total, order) => total + order.amount, 0);

        // 2. Đếm số lượng đơn hàng, sản phẩm và khách hàng
        const orderCount = await orderModel.countDocuments({});
        const productCount = await productModel.countDocuments({});
        const userCount = await userModel.countDocuments({});

        // 3. Lấy 5 đơn hàng gần đây nhất để hiển thị bảng Recent Orders
        const recentOrders = await orderModel.find({})
            .sort({ date: -1 }) // Sắp xếp theo ngày mới nhất
            .limit(5);

        // Trả về đúng cấu trúc mà Frontend của bạn đang dùng (res.data)
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
        console.log("Lỗi Dashboard Stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { getDashboardStats };