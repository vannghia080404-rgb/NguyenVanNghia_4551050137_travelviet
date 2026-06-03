import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import heroImage from "@/assets/hero-halong1111.jpg";
import logoLeaf from "@/assets/logo-leaf.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ email và mật khẩu",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      
      if (response.data.success) {
        loginAction(response.data.token, response.data.data);
        toast({
          title: "Thành công",
          description: "Đăng nhập thành công!",
        });
        
        // Redirect based on role
        if (response.data.data.role === 'admin' || response.data.data.role === 'staff') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      if (error.response?.data?.unverified) {
        toast({
          variant: "destructive",
          title: "Chưa xác thực",
          description: "Tài khoản của bạn chưa được xác thực email. Vui lòng xác thực.",
        });
        handleResendOtp(email);
        setShowOtpModal(true);
      } else {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: error.response?.data?.message || "Email hoặc mật khẩu không chính xác",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      if (response.data.success) {
        toast({ title: "Thành công", description: "Xác thực email thành công!" });
        loginAction(response.data.token, response.data.data);
        setShowOtpModal(false);
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xác thực thất bại",
        description: error.response?.data?.message || "Mã OTP không hợp lệ",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async (targetEmail: string) => {
    try {
      const response = await api.post("/auth/resend-otp", { email: targetEmail });
      if (response.data.success) {
        toast({ title: "Đã gửi lại", description: "Vui lòng kiểm tra email của bạn." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", description: "Không thể gửi lại mã." });
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Form side */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-10">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white group-hover:scale-105 transition-smooth ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden">
              <img src={logoLeaf} alt="TravelViet" className="h-8 w-8 object-contain mix-blend-multiply contrast-150" />
            </div>
            <div className="leading-none">
              <span className="font-display text-2xl font-bold text-primary block">TravelViet</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Khám phá Việt Nam</span>
            </div>
          </Link>

          <h1 className="mt-12 font-display text-3xl md:text-4xl font-bold text-foreground">Đăng nhập tài khoản</h1>
          <p className="mt-3 text-muted-foreground">Chào mừng bạn trở lại! Khám phá vẻ đẹp Việt Nam cùng chúng tôi.</p>

          <form className="mt-10 space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Hãy điền địa chỉ email của bạn..." 
                  className="pl-10 h-12" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Hãy điền mật khẩu của bạn..."
                  className="pl-10 pr-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer text-sm">
              <Checkbox /> Ghi nhớ đăng nhập
            </label>

            <Button variant="hero" size="lg" type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Đăng nhập"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <span className="relative bg-background px-4 mx-auto flex justify-center text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Hoặc đăng nhập với
              </span>
            </div>

            <Button variant="outline" size="lg" className="w-full gap-3" type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/api/auth/google`}>
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Tiếp tục với Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-semibold text-accent hover:underline">Đăng ký ngay</Link>
            </p>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận Email</DialogTitle>
            <DialogDescription>
              Tài khoản của bạn chưa được xác thực. Chúng tôi đã gửi một mã gồm 6 chữ số đến email <span className="font-semibold text-foreground">{email}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nhập mã 6 chữ số"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest h-14 font-mono"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full h-12" disabled={isVerifying || otp.length !== 6}>
              {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Xác thực tài khoản"}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Không nhận được mã?{" "}
              <button type="button" onClick={() => handleResendOtp(email)} className="text-primary hover:underline font-medium">Gửi lại mã</button>
            </p>
          </form>
        </DialogContent>
      </Dialog>


      {/* Image side */}
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImage} alt="Việt Nam" className="absolute inset-0 w-full h-full object-cover" />
        {/* Neutral dark overlay for natural colors */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

        <div className="absolute inset-0 flex flex-col justify-center p-12 text-white">
          <span className="inline-block w-fit px-4 py-1.5 bg-accent/90 text-accent-foreground rounded-full text-xs font-semibold uppercase tracking-wide shadow-glow">
            Authentic Experiences
          </span>
          <h2 className="mt-6 font-display text-4xl xl:text-5xl font-bold leading-tight max-w-md drop-shadow-2xl">
            TravelViet – Chuyên gia<br />du lịch Việt Nam
          </h2>
          <p className="mt-5 text-white/90 max-w-md leading-relaxed drop-shadow-lg">
            Khám phá linh hồn nhịp nhàng của Việt Nam thông qua những hành trình được tuyển chọn kỹ lưỡng, kết hợp vẻ đẹp tự nhiên với chiều sâu văn hoá.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { v: "15k+", l: "Khách hàng" },
              { v: "200+", l: "Điểm đến" },
              { v: "4.9/5", l: "Đánh giá" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl font-bold text-accent drop-shadow-md">{s.v}</div>
                <div className="text-sm text-white/80 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
