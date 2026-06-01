import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-halong1111.jpg";
import logoLeaf from "@/assets/logo-leaf.png";
import api from "@/lib/api";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không tìm thấy tài khoản với email này.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Đã gửi lại email đặt lại mật khẩu!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi lại thất bại.");
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

          {!sent ? (
            <>
              <h1 className="mt-12 font-display text-3xl md:text-4xl font-bold text-foreground">Quên mật khẩu?</h1>
              <p className="mt-3 text-muted-foreground">
                Nhập email đăng ký tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
              </p>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="mt-1.5 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</> : "Gửi link đặt lại mật khẩu"}
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
            <div className="mt-12 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Email đã được gửi!</h1>
              <p className="mt-3 text-muted-foreground">
                Chúng tôi đã gửi link đặt lại mật khẩu đến <span className="font-semibold text-foreground">{email}</span>.
                Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
              </p>

              <div className="mt-8 p-4 rounded-xl bg-secondary/60 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Đã nhận được mã?</span> Hãy nhấn vào nút bên dưới để đặt lại mật khẩu.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Button variant="hero" size="lg" className="w-full" onClick={() => navigate(`/reset-password?email=${email}`)}>
                  Nhập mã OTP & Đổi mật khẩu
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={handleResend} disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</> : "Gửi lại email"}
                </Button>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image side */}
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImage} alt="Việt Nam" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-primary/30" />

        <div className="absolute inset-0 flex flex-col justify-center p-12 text-primary-foreground">
          <span className="inline-block w-fit px-4 py-1.5 bg-accent/90 text-accent-foreground rounded-full text-xs font-semibold uppercase tracking-wide">
            Bảo mật tài khoản
          </span>
          <h2 className="mt-6 font-display text-4xl xl:text-5xl font-bold leading-tight max-w-md">
            Đừng lo lắng,<br />chúng tôi sẽ giúp bạn
          </h2>
          <p className="mt-5 text-primary-foreground/85 max-w-md leading-relaxed">
            Quy trình đặt lại mật khẩu đơn giản và an toàn. Tài khoản của bạn luôn được bảo vệ bởi hệ thống bảo mật đa lớp.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
