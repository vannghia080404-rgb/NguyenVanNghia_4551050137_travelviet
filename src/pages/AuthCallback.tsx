import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Pass token in headers temporarily to fetch profile
      api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          loginAction(token, res.data.data);
          navigate("/");
        })
        .catch(() => {
          navigate("/login?error=auth_failed");
        });
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, loginAction]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-medium">Đang xác thực đăng nhập...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
