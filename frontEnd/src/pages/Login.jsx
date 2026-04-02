import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axiosInstance from "../customize/axios";
import Title from "../components/Title";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (currentState === "Sign Up") {
        if (password !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp");
          return;
        }
        const res = await axiosInstance.post("/user/register", {
          name,
          email,
          password,
        });

        if (res.success) {
          setToken(res.access_token);
          localStorage.setItem("token", res.access_token);
          localStorage.setItem("refresh_token", res.refresh_token);
          toast.success("Tạo tài khoản thành công!");
          setCurrentState("Login");
          setEmail("");
          setPassword("");
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await axiosInstance.post("/user/login", {
          email,
          password,
        });

        if (res.success) {
          setToken(res.access_token);
          localStorage.setItem("token", res.access_token);
          localStorage.setItem("refresh_token", res.refresh_token);
          toast.success("Đăng nhập thành công");
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message || "Có lỗi xảy ra");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="border-t min-h-[calc(100vh-10rem)] bg-gradient-to-b from-stone-50 to-white py-10 sm:py-14 px-4">
      <div className="max-w-md mx-auto text-center mb-8">
        <Title
          text1={currentState === "Login" ? "ĐĂNG" : "ĐĂNG KÝ"}
          text2={currentState === "Login" ? "NHẬP" : "TÀI KHOẢN"}
          className="justify-center"
        />
        <p className="text-stone-500 text-sm mt-2">
          {currentState === "Login"
            ? "Đăng nhập để theo dõi đơn hàng và giỏ hàng của bạn."
            : "Tạo tài khoản mới — chỉ mất vài giây."}
        </p>
      </div>

      <div className="max-w-md mx-auto rounded-2xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          {currentState === "Sign Up" && (
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                Họ tên
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                required
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-stone-800/15 focus:border-stone-400"
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              required
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-stone-800/15 focus:border-stone-400"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Mật khẩu
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              required
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-stone-800/15 focus:border-stone-400"
              placeholder="••••••••"
            />
          </div>
          {currentState === "Sign Up" && (
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                Xác nhận mật khẩu
              </label>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                value={confirmPassword}
                required
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-stone-800/15 focus:border-stone-400"
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2 text-sm text-stone-600 pt-1">
            <span className="cursor-default text-stone-400">Quên mật khẩu?</span>
            {currentState === "Login" ? (
              <button
                type="button"
                onClick={() => setCurrentState("Sign Up")}
                className="font-medium text-stone-900 hover:underline underline-offset-4"
              >
                Tạo tài khoản
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentState("Login")}
                className="font-medium text-stone-900 hover:underline underline-offset-4"
              >
                Đã có tài khoản? Đăng nhập
              </button>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            {currentState === "Login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">hoặc</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Facebook login */}
        <a
          href={`${BACKEND_URL}/user/auth/facebook`}
          className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          Đăng nhập bằng Facebook
        </a>
      </div>
    </div>
  );
};

export default Login;
