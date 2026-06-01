import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Loader2, PlaySquare, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoLeaf from "@/assets/logo-leaf.png";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/useSettingsStore";

const Footer = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const { settings } = useSettingsStore();

  const subscribeMutation = useMutation({
    mutationFn: (emailData: string) => api.post('/subscribe', { email: emailData }),
    onSuccess: () => {
      toast.success("Đăng ký thành công! Bạn sẽ nhận được các ưu đãi mới nhất.");
      setEmail("");
    },
    onError: () => {
      toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email);
  };

  if (location.pathname.startsWith("/login") || location.pathname.startsWith("/register") || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-card text-foreground mt-20 border-t border-border/50">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden">
                <img 
                  src={logoLeaf} 
                  alt="TravelViet" 
                  className="h-8 w-8 object-contain mix-blend-multiply contrast-150" 
                />
              </div>
              <span className="font-display text-xl font-bold text-foreground">TravelViet</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Khám phá vẻ đẹp Việt Nam qua những hành trình được tuyển chọn kỹ lưỡng và những kết nối địa phương chân thực.
            </p>
            <div className="flex gap-3">
              {[
                { name: 'Facebook', icon: Facebook, url: settings.social_facebook, enabled: settings.social_facebook_enabled },
                { name: 'YouTube', icon: Youtube, url: settings.social_youtube, enabled: settings.social_youtube_enabled },
                { name: 'TikTok', icon: PlaySquare, url: settings.social_tiktok, enabled: settings.social_tiktok_enabled },
                { name: 'Zalo', icon: MessageCircle, url: settings.social_zalo, enabled: settings.social_zalo_enabled }
              ].map(({ name, icon: Icon, url, enabled }, i) => (
                <button
                  key={name}
                  onClick={() => {
                    if (String(enabled) !== "true" || !url) {
                      toast("Tính năng đang cập nhật, vui lòng quay lại sau");
                    } else {
                      window.open(url, '_blank');
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  aria-label={name}
                  title={name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/tours" className="hover:text-primary transition-smooth">Tours & Hoạt động</Link></li>
              <li><Link to="/destinations" className="hover:text-primary transition-smooth">Điểm đến</Link></li>
              <li><Link to="/tours" className="hover:text-primary transition-smooth">Ưu đãi đặc biệt</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-smooth">Cẩm nang du lịch</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4 text-foreground">Hỗ trợ</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-smooth">Chính sách bảo mật</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-smooth">Điều khoản dịch vụ</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-smooth">FAQ</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-smooth">Du lịch bền vững</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4 text-foreground">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2 items-start">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                {settings.company_address || "Đang cập nhật"}
              </li>
              <li className="flex gap-2 items-center">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                {settings.company_phone || "Đang cập nhật"}
              </li>
              <li className="flex gap-2 items-center">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                {settings.company_email || "Đang cập nhật"}
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-border/10">
              <h3 className="font-display font-semibold mb-2 text-foreground">Đăng ký nhận bản tin</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Nhận ngay các ưu đãi tour du lịch và cẩm nang khám phá mới nhất qua email của bạn.
              </p>
              <form className="flex gap-2" onSubmit={handleSubscribe}>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-9 text-sm"
                />
                <Button type="submit" variant="accent" size="sm" className="h-9 whitespace-nowrap" disabled={subscribeMutation.isPending}>
                  {subscribeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đăng ký"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/15 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TravelViet. Khám phá nhịp điệu Việt Nam.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
