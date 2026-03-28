import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/ShopContext";
import Title from "../Title";
import { toast } from "react-toastify";
import axiosInstance from "../../customize/axios";

const Order = () => {
  const { token, currency, navigate } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);

  const loadorderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axiosInstance.post("/order/userorders", {});
      if (response.success) {
        const allOrdersItem = [];
        response.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              orderId: order._id,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });
        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Không tải được đơn hàng");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      const response = await axiosInstance.post("/order/cancel", { orderId });
      if (response.success) {
        toast.success("Đã hủy đơn hàng");
        loadorderData();
      } else {
        toast.error(response.message || "Hủy đơn thất bại");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Xóa đơn hàng đã hủy này?")) return;
    try {
      const response = await axiosInstance.post("/order/delete-cancelled", { orderId });
      if (response.success) {
        toast.success("Đã xóa đơn hàng");
        loadorderData();
      } else {
        toast.error(response.message || "Xóa thất bại");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xóa thất bại");
    }
  };

  useEffect(() => {
    loadorderData();
  }, [token]);

  const statusColor = (status) => {
    if (status === "Cancelled") return "bg-red-400";
    return "bg-emerald-500";
  };

  return (
    <div className="border-t pt-10 sm:pt-14 pb-16 min-h-[50vh] bg-gradient-to-b from-stone-50/60 to-white">
      <div className="mb-8">
        <Title text1="ĐƠN" text2="HÀNG" />
        <p className="text-stone-500 text-sm mt-1">
          Theo dõi trạng thái và chi tiết từng sản phẩm đã đặt.
        </p>
      </div>

      {orderData.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <p className="text-stone-600 font-medium">Chưa có đơn hàng</p>
          <p className="text-stone-500 text-sm mt-2 mb-6">
            Đơn của bạn sẽ hiển thị tại đây sau khi đặt thành công.
          </p>
          <button
            type="button"
            onClick={() => navigate("/collection")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orderData.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}-${item.date}-${index}`}
              className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-5"
            >
              <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                <img
                  className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl border border-stone-100 shrink-0"
                  src={item.image?.[0] || ""}
                  alt=""
                />
                <div className="min-w-0 text-sm sm:text-base">
                  <p className="font-medium text-stone-900">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-stone-600">
                    <span className="font-medium text-stone-800">
                      {currency}
                      {item.price}
                    </span>
                    <span className="text-stone-500">× {item.quantity}</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-xs font-medium text-stone-700">
                      Size {item.size}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-stone-500">
                    {new Date(item.date).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {item.paymentMethod}
                    {item.payment ? " · Đã thanh toán" : " · Chưa thanh toán"}
                  </p>
                </div>
              </div>
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[140px] shrink-0 border-t md:border-t-0 border-stone-100 pt-4 md:pt-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor(item.status)}`} />
                  <span className="text-sm font-medium text-stone-800">
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {item.status === "Order Placed" && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(item.orderId)}
                      className="text-sm font-medium text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Hủy đơn
                    </button>
                  )}
                  {item.status === "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(item.orderId)}
                      className="text-sm font-medium text-stone-500 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadorderData}
                    className="text-sm font-medium text-stone-700 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
