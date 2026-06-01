import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-halong1111.jpg";
import logoLeaf from "@/assets/logo-leaf.png";
import api from "@/lib/api";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromUrl = queryParams.get("email") || "";

  const [step, setStep] = useState(1); // 1: OTP & Password, 2: Success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: emailFromUrl,
    otp: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/auth/reset-password", formData);
      setStep(2);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Form side */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-10">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary ring-1 ring-primary/10 group-hover:scale-105 transition-smooth">
              <img src={logoLeaf} alt="TravelViet" className="h-8 w-8 object-contain" />
            </div>
            <div className="leading-none">
              <span className="font-display text-2xl font-bold text-primary block">TravelViet</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Khám phá Việt Nam</span>
            </div>
          </Link>

          {step === 1 ? (
            <>
              <h1 className="mt-12 font-display text-3xl md:text-4xl font-bold text-foreground">Đặt lại mật khẩu</h1>
              <p className="mt-3 text-muted-foreground">
                Nhập mã OTP đã được gửi đến email của bạn và mật khẩu mới.
              </p>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 bg-secondary/50 cursor-not-allowed"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    readOnly={!!emailFromUrl}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Mã OTP (6 số)</label>
                  <div className="mt-1.5 relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="123456"
                      className="pl-10 h-12"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      required
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
                  <div className="mt-1.5 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      value={formData.new_password}
                      onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu mới</label>
                  <div className="mt-1.5 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      value={formData.new_password_confirmation}
                      onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</> : "Cập nhật mật khẩu"}
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
                </Link>
              </form>
            </>
          ) : (
            <div className="mt-12 animate-fade-in text-center">
              <div className="h-20 w-20 rounded-full bg-success/15 flex items-center justify-center mb-8 mx-auto">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Thành công!</h1>
              <p className="mt-4 text-muted-foreground">
                Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </p>

              <Button variant="hero" size="lg" className="w-full mt-10" onClick={() => navigate("/login")}>
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image side */}
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImage} alt="Việt Nam" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-primary/30" />
      </div>
    </main>
  );
};

export default ResetPassword;
