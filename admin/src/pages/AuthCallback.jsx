import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Nhận token từ Facebook OAuth redirect và lưu vào localStorage
const AuthCallback = ({ setToken }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const error = searchParams.get("error");

    if (access_token) {
      localStorage.setItem("token", access_token);
      setToken(access_token);
    } else {
      console.error("Facebook login failed:", error);
      navigate("/");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default AuthCallback;
