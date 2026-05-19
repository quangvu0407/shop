import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../context/ShopContext";
import Title from "../Title";
import { toast } from "react-toastify";
import axiosInstance from "../../customize/axios";

const Order = () => {
  const { token, currency, navigate } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      if (!token) return;
      const response = await axiosInstance.post("/order/userorders", {});
      if (response.success) {
        setOrders([...response.orders].reverse());
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load orders");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await axiosInstance.post("/order/cancel", { orderId });
      if (response.success) { toast.success("Order cancelled"); loadOrders(); }
      else toast.error(response.message || "Cancellation failed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cancellation failed");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this cancelled order?")) return;
    try {
      const response = await axiosInstance.post("/order/delete-cancelled", { orderId });
      if (response.success) { toast.success("Order deleted"); loadOrders(); }
      else toast.error(response.message || "Deletion failed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Deletion failed");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [token]);

  const statusColor = (status) => {
    if (status === "Cancelled") return "bg-red-400";
    if (status === "Delivered") return "bg-emerald-500";
    return "bg-blue-400";
  };

  return (
    <div className="border-t pt-10 sm:pt-14 pb-16 min-h-[50vh] bg-gradient-to-b from-stone-50/60 to-white">
      <div className="mb-8">
        <Title text1="YOUR" text2="ORDERS" />
        <p className="text-stone-500 text-sm mt-1">Track the status and details of your orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <p className="text-stone-600 font-medium">No orders yet</p>
          <p className="text-stone-500 text-sm mt-2 mb-6">Your orders will appear here after successful placement.</p>
          <button
            type="button"
            onClick={() => navigate("/collection")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header đơn hàng */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
                <div className="text-xs text-stone-500">
                  <span className="font-mono text-stone-400">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="mx-2">·</span>
                  {new Date(order.date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                  <span className="mx-2">·</span>
                  {order.paymentMethod}
                  <span className={`ml-2 font-semibold ${order.payment ? "text-emerald-600" : "text-amber-500"}`}>
                    {order.payment ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor(order.status)}`} />
                  <span className="text-sm font-semibold text-stone-800">{order.status}</span>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img
                      className="w-14 h-16 object-cover rounded-xl border border-stone-100 shrink-0"
                      src={item.image?.[0] || ""}
                      alt={item.name}
                    />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-medium text-stone-900 truncate">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-stone-500 text-xs">
                        <span>{currency}{item.price?.toLocaleString()}</span>
                        <span>× {item.quantity}</span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-700">Size {item.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: tổng tiền + actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-100">
                <div className="text-sm">
                  <span className="text-stone-500">{order.items.length} items · Total: </span>
                  <span className="font-bold text-stone-900 text-base">{currency}{order.amount?.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  {order.status === "Order Placed" && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order._id)}
                      className="text-sm font-medium text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order._id)}
                      className="text-sm font-medium text-stone-500 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadOrders}
                    className="text-sm font-medium text-stone-700 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    Refresh
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
