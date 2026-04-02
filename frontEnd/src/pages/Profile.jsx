import React, { useState, useEffect, useContext, useCallback } from "react";
import axiosInstance from "../customize/axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Eye, EyeOff, Package, ShoppingBag, LogOut } from "lucide-react";
import Title from "../components/Title";

const Profile = () => {
  const { getCartCount, navigate, token, setToken, setCartItems } =
    useContext(ShopContext);

  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("name");

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    newName: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const loadOrderCount = useCallback(async () => {
    try {
      const res = await axiosInstance.post("/order/userorders", {});
      if (res.success && Array.isArray(res.orders)) {
        setOrderCount(res.orders.length);
      }
    } catch {
      setOrderCount(0);
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/user/profile");
      if (res.success && res.user) {
        setUser(res.user);
        setFormData((prev) => ({ ...prev, newName: res.user.name || "" }));
      } else {
        toast.error(res.message || "Không tải được hồ sơ");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Không tải được hồ sơ. Đăng nhập lại."
      );
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const stored =
      typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !stored) {
      navigate("/login");
      return;
    }
    getProfile();
    loadOrderCount();
  }, [token, navigate, getProfile, loadOrderCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        mode === "name" ? "/user/update-name" : "/user/change-password";

      if (mode === "password" && formData.newPassword !== formData.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }

      const res = await axiosInstance.post(endpoint, formData);
      if (res.success) {
        toast.success(
          mode === "name" ? "Cập nhật tên thành công" : "Đổi mật khẩu thành công"
        );
        setIsModalOpen(false);
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        getProfile();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setToken("");
    setCartItems([]);
    navigate("/login");
    toast.success("Đã đăng xuất");
  };

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-[60vh] border-t flex items-center justify-center bg-stone-50/80">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <div className="h-9 w-9 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
          <p className="text-sm">Đang tải hồ sơ…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t bg-gradient-to-b from-stone-50 via-white to-stone-50/50 min-h-[calc(100vh-8rem)] py-10 sm:py-14 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <Title text1="TÀI KHOẢN" text2="CỦA BẠN" />
          <p className="text-stone-500 text-sm mt-1 max-w-md">
            Quản lý thông tin cá nhân và bảo mật đăng nhập.
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-stone-200/80 overflow-hidden">
          <div className="h-24 sm:h-28 bg-gradient-to-r from-stone-800 to-stone-600" />
          <div className="px-6 sm:px-8 pb-8 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-md border-4 border-white flex items-center justify-center shrink-0">
                <span className="text-3xl font-semibold text-stone-800">
                  {initial}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-2 sm:pb-1">
                <h1 className="text-xl sm:text-2xl font-medium text-stone-900 truncate">
                  {user?.name || "Khách"}
                </h1>
                <p className="text-stone-500 text-sm truncate">{user?.email}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 text-left hover:border-stone-300 hover:bg-stone-50 transition-colors group"
              >
                <ShoppingBag
                  className="w-5 h-5 text-stone-600 mb-2 group-hover:text-stone-900"
                  strokeWidth={1.5}
                />
                <p className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                  Giỏ hàng
                </p>
                <p className="text-2xl font-semibold text-stone-800 tabular-nums">
                  {getCartCount()}
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 text-left hover:border-stone-300 hover:bg-stone-50 transition-colors group"
              >
                <Package
                  className="w-5 h-5 text-stone-600 mb-2 group-hover:text-stone-900"
                  strokeWidth={1.5}
                />
                <p className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                  Đơn hàng
                </p>
                <p className="text-2xl font-semibold text-stone-800 tabular-nums">
                  {orderCount}
                </p>
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3.5 bg-white">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                    Họ tên
                  </p>
                  <p className="text-stone-900 font-medium truncate">{user?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("name");
                    setIsModalOpen(true);
                  }}
                  className="text-sm font-medium text-stone-700 hover:text-stone-900 shrink-0 underline-offset-4 hover:underline"
                >
                  Sửa
                </button>
              </div>

              <div className="rounded-xl border border-stone-200 px-4 py-3.5 bg-stone-50/50">
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-stone-900 font-medium truncate">{user?.email}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("password");
                  setIsModalOpen(true);
                }}
                className="flex-1 py-3.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex-1 py-3.5 rounded-xl border border-stone-300 text-stone-800 text-sm font-medium hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            aria-label="Đóng"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900 text-center mb-1">
              {mode === "name" ? "Cập nhật tên" : "Đổi mật khẩu"}
            </h2>
            <p className="text-center text-sm text-stone-500 mb-6">
              {mode === "name"
                ? "Tên hiển thị trên đơn hàng và hồ sơ."
                : "Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 8 ký tự)."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "name" ? (
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Tên mới
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1.5 w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-400"
                    value={formData.newName}
                    onChange={(e) =>
                      setFormData({ ...formData, newName: e.target.value })
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type={showPassword.old ? "text" : "password"}
                      placeholder="Mật khẩu hiện tại"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 pr-12 focus:outline-none focus:ring-2 focus:ring-stone-800/20"
                      value={formData.oldPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, oldPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("old")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    >
                      {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      placeholder="Mật khẩu mới"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 pr-12 focus:outline-none focus:ring-2 focus:ring-stone-800/20"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("new")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    >
                      {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 pr-12 focus:outline-none focus:ring-2 focus:ring-stone-800/20"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("confirm")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    >
                      {showPassword.confirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
