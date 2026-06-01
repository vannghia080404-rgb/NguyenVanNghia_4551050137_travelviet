import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Facebook, Youtube, MessageCircle, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import tourSapa from "@/assets/tour-sapa.jpg";

import { useSettingsStore } from "@/store/useSettingsStore";

const Contact = () => {
  const { settings } = useSettingsStore();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const contactInfo = [
    { icon: MapPin, title: "Văn phòng", lines: [settings.company_address || "Đang cập nhật"] },
    { icon: Phone, title: "Điện thoại", lines: [settings.company_phone || "Đang cập nhật"] },
    { icon: Mail, title: "Email", lines: [settings.company_email || "Đang cập nhật"] },
    { icon: Clock, title: "Giờ làm việc", lines: ["Thứ 2 – Thứ 7: 8:00 – 18:00", "Chủ nhật: 9:00 – 17:00"] },
  ];

  const submitMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/contact', data),
    onSuccess: () => {
      toast({
        title: "Đã gửi tin nhắn",
        description: "Chúng tôi sẽ phản hồi trong vòng 24 giờ. Cảm ơn bạn!",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Lỗi kết nối",
        description: "Hiện tại hệ thống chưa thể gửi tin nhắn. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative h-[300px] md:h-[400px] flex items-center justify-center text-white overflow-hidden">
        <img src={tourSapa} alt="Liên hệ TravelViet" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="relative container text-center">
          <span className="inline-flex w-fit items-center gap-2 px-4 py-1.5 bg-accent/90 text-accent-foreground rounded-full text-xs font-semibold uppercase tracking-wide mx-auto shadow-glow">
            <MessageCircle className="h-3.5 w-3.5" /> Liên hệ
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold drop-shadow-lg text-white">Chúng tôi luôn sẵn sàng lắng nghe</h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/90 drop-shadow-md">
            Có câu hỏi về tour, cần tư vấn lịch trình hay muốn hợp tác? Hãy gửi tin nhắn cho TravelViet ngay hôm nay.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="container -mt-12 relative z-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((c) => (
            <div key={c.title} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <div className="h-11 w-11 rounded-xl gradient-accent flex items-center justify-center text-accent-foreground shadow-soft">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display font-bold text-foreground">{c.title}</h3>
              {c.lines.map((l) => (
                <p key={l} className="text-sm text-muted-foreground mt-1">{l}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="container py-20 grid lg:grid-cols-[1.1fr_1fr] gap-10">
        <div className="bg-card rounded-2xl p-8 md:p-10 shadow-soft border border-border/50">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">Gửi tin nhắn cho chúng tôi</h2>
          <p className="mt-2 text-muted-foreground text-sm">Điền thông tin bên dưới và chúng tôi sẽ liên hệ trong 24h.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground">Họ và tên</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Hãy điền họ và tên của bạn..."
                  className="mt-1.5 h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Hãy điền địa chỉ email của bạn..."
                  className="mt-1.5 h-12"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tiêu đề</label>
              <Input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Hãy điền tiêu đề tin nhắn..."
                className="mt-1.5 h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Nội dung</label>
              <Textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Hãy điền nội dung tin nhắn của bạn..."
                rows={6}
                className="mt-1.5 resize-none"
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gửi tin nhắn
            </Button>
          </form>
        </div>

        {/* Map + Social */}
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-card border border-border/50 h-[360px] relative group">
            {settings.company_map ? (
              settings.company_map.trim().startsWith("<iframe") ? (
                <div dangerouslySetInnerHTML={{ __html: settings.company_map }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0" />
              ) : (
                <iframe
                  title="TravelViet office"
                  src={settings.company_map}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )
            ) : (
              <iframe
                title="TravelViet office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.050410769999!2d109.2152824148303!3d13.758959690343235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f6cebf252c49f%3A0xa83caa291737172f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBRdXkgTmjGoW4!5e0!3m2!1svi!2s!4v1714970000000!5m2!1svi!2s"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            <a
              href="https://www.google.com/maps/place/Quy+Nhon+University/@13.7589597,109.2152824,17z/data=!3m1!4b1!4m6!3m5!1s0x316f6cebf252c49f:0xa83caa291737172f!8m2!3d13.7589597!4d109.2178573!16s%2Fg%2F120ylnmc"
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 bg-card text-primary text-xs font-semibold px-3 py-2 rounded-lg shadow-card hover:bg-primary hover:text-primary-foreground transition-smooth"
            >
              Mở trên Google Maps ↗
            </a>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <h3 className="font-display font-bold text-foreground">Theo dõi chúng tôi</h3>
            <p className="text-sm text-muted-foreground mt-1">Cập nhật ưu đãi và hành trình mới nhất</p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Facebook, label: "Facebook", url: settings.social_facebook, enabled: settings.social_facebook_enabled },
                { icon: Youtube, label: "Youtube", url: settings.social_youtube, enabled: settings.social_youtube_enabled },
                { icon: Music2, label: "TikTok", url: settings.social_tiktok, enabled: settings.social_tiktok_enabled },
                { icon: MessageCircle, label: "Zalo", url: settings.social_zalo?.startsWith('http') ? settings.social_zalo : (settings.social_zalo ? `https://zalo.me/${settings.social_zalo.replace(/[^0-9]/g, '')}` : ''), enabled: settings.social_zalo_enabled },
              ].filter(s => s.enabled === "true").map((s) => (
                <a
                  key={s.label}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!s.url || s.url === "#") {
                      e.preventDefault();
                      toast({ description: "Tính năng đang cập nhật, vui lòng quay lại sau" });
                    }
                  }}
                  aria-label={s.label}
                  className="h-11 w-11 rounded-xl bg-secondary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden p-6 text-white shadow-card group">
            <img src={tourSapa} alt="Hỗ trợ" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
            <div className="relative z-10">
              <h3 className="font-display font-bold text-lg text-white">Cần hỗ trợ gấp?</h3>
              <p className="text-sm text-white/80 mt-1">Hotline 24/7 dành cho khách hàng đang trong tour.</p>
              <a 
                href={settings.social_zalo?.startsWith('http') ? settings.social_zalo : `https://zalo.me/${(settings.social_zalo || settings.company_phone || "19001234").replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-[#0068FF] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0055d4] hover:shadow-[0_0_15px_rgba(0,104,255,0.4)] transition-smooth"
              >
                <MessageCircle className="h-4 w-4" /> Chat Zalo ngay
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Zalo Bubble */}
      <a
        href={settings.social_zalo?.startsWith('http') ? settings.social_zalo : `https://zalo.me/${(settings.social_zalo || settings.company_phone || "19001234").replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-50 flex items-center justify-center w-[52px] h-[52px] bg-[#0068FF] text-white rounded-full shadow-[0_4px_20px_rgba(0,104,255,0.5)] hover:scale-110 hover:shadow-[0_4px_25px_rgba(0,104,255,0.7)] transition-all duration-300 group"
        aria-label="Chat Zalo"
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#0068FF] animate-ping opacity-20 group-hover:hidden"></div>
        <MessageCircle className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-red-500 text-[10px] font-bold items-center justify-center text-white border-[1.5px] border-white">1</span>
        </span>
      </a>
    </main>
  );
};

export default Contact;
