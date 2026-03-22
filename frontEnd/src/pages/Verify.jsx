import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../customize/axios";
import { toast } from "react-toastify";

const Verify = () => {
  const { navigate, clearCart } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = async () => {
    try {
      const response = await axiosInstance.post("/order/verifyStripe", {
        success,
        orderId,
      });

      if (response.success) {
        setStatus("ok");
        await clearCart();
        navigate("/orders");
      } else {
        setStatus("fail");
        if (response.message) {
          toast.error(response.message);
        }
        navigate("/cart");
      }
    } catch (error) {
      console.log(error);
      setStatus("error");
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Xác thực thanh toán thất bại"
      );
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="min-h-[60vh] border-t flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-md w-full rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
          {status === "loading" && (
            <div className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
          )}
          {status === "ok" && (
            <span className="text-2xl text-emerald-600" aria-hidden>
              ✓
            </span>
          )}
          {(status === "fail" || status === "error") && (
            <span className="text-2xl text-red-500" aria-hidden>
              !
            </span>
          )}
        </div>
        <h1 className="text-lg font-semibold text-stone-900">
          {status === "loading" && "Đang xác thực thanh toán…"}
          {status === "ok" && "Thanh toán thành công"}
          {(status === "fail" || status === "error") && "Không thể hoàn tất"}
        </h1>
        <p className="mt-2 text-sm text-stone-500 leading-relaxed">
          {status === "loading" &&
            "Vui lòng chờ trong giây lát, không đóng trang này."}
          {status === "ok" && "Đang chuyển đến trang đơn hàng của bạn."}
          {(status === "fail" || status === "error") &&
            "Bạn sẽ được chuyển về giỏ hàng nếu thanh toán chưa hoàn tất."}
        </p>
      </div>
    </div>
  );
};

export default Verify;
