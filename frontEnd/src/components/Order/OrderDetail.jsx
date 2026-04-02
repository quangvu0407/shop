import React from "react";
import Title from "../Title";

const OrderDetail = ({ data, setOpen, setData }) => {
  const close = () => {
    setOpen(false);
    setData("");
  };

  // Màu sắc cho trạng thái
  const getStatusColor = (status) => {
    if (status === "Cancelled") return "text-red-500 bg-red-50 border-red-100";
    if (status === "Delivered")
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    return "text-blue-600 bg-blue-50 border-blue-100";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
      onClick={close}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút X */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-2xl">×</span>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <Title text1="CHI TIẾT" text2="ĐƠN HÀNG" />
          </div>

          {/* Danh sách thông tin theo hàng dọc */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-gray-50 pb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Sản phẩm
              </label>
              <p className="text-gray-800 font-semibold leading-tight">
                {data.name}
              </p>
            </div>

            <div className="border-b border-gray-50 pb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Giá tiền
              </label>
              <p className="text-stone-900 font-bold text-lg">
                {data.price?.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div className="border-b border-gray-50 pb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Thông số
              </label>
              <p className="text-gray-700 font-medium">
                Size: {data.size} — SL: {data.quantity}
              </p>
            </div>

            <div className="border-b border-gray-50 pb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Ngày đặt hàng
              </label>
              <p className="text-gray-700">
                {new Date(data.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="border-b border-gray-50 pb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Thanh toán
              </label>
              <p className="text-gray-700">{data.paymentMethod}</p>
              <p
                className={`text-xs font-bold mt-1 ${data.payment ? "text-emerald-500" : "text-amber-500"}`}
              >
                {data.payment ? "● Đã thanh toán" : "● Chưa thanh toán"}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-3">
                Trạng thái vận chuyển
              </label>
              <div
                className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(data.status)}`}
              >
                {data.status}
              </div>
            </div>
          </div>

          {/* Nút OK */}
          <div className="flex justify-end">
            <button
              onClick={close}
              className="px-4 py-1.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 active:scale-[0.97] transition-all"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
