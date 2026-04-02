import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { setToken } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Đăng nhập Facebook thất bại");
      navigate("/login");
      return;
    }

    if (access_token) {
      localStorage.setItem("token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      setToken(access_token);
      toast.success("Đăng nhập Facebook thành công");
      navigate("/");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-stone-500">Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default AuthCallback;
