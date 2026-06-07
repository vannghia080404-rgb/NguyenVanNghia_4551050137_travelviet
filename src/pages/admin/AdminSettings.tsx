import { useState, useEffect } from "react";
import { Save, Settings, Phone, MapPin, Share2, CreditCard, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fetchGlobalSettings = useSettingsStore(state => state.fetchSettings);

  const [settings, setSettings] = useState({
    company_name: "",
    company_phone: "",
    company_email: "",
    company_address: "",
    company_map: "",
    social_facebook: "",
    social_facebook_enabled: "true",
    social_youtube: "",
    social_youtube_enabled: "true",
    social_tiktok: "",
    social_tiktok_enabled: "false",
    social_zalo: "",
    social_zalo_enabled: "false",
    payment_vnpay_enabled: "true",
    payment_viettel_enabled: "true",
    payment_momo_enabled: "false",
    payment_cash_enabled: "true",
    page_terms: "",
    page_privacy: "",
    page_about: "",
    page_faq: "",
    stat_experience_years: "10+",
    stat_happy_customers: "15.000+",
    shop_shipping_fee: "30000",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/global');
      if (res.data.success) {
        // Replace any null values with empty strings to prevent React warnings
        const sanitizedData = Object.fromEntries(
          Object.entries(res.data.data).map(([k, v]) => [k, v === null ? "" : v])
        );
        setSettings(prev => ({ ...prev, ...sanitizedData }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post('/settings', settings);
      if (res.data.success) {
        toast({ title: "Thành công", description: "Đã lưu cấu hình hệ thống." });
        fetchGlobalSettings(); // refresh global store so Footer updates instantly
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu cấu hình." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string) => {
    setSettings(prev => ({ ...prev, [name]: prev[name as keyof typeof prev] === "true" ? "false" : "true" }));
  };

  return (
    <AdminLayout title="Cài Đặt Hệ Thống">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Cài Đặt Cấu Hình (CMS)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Quản lý toàn bộ thông tin tĩnh của website mà không cần sửa code.</p>
          </div>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2 text-foreground">
              <Phone className="h-5 w-5 text-blue-500" /> Thông tin Công ty
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/80">Tên công ty</label>
                <Input name="company_name" className="bg-background text-foreground border-border" value={settings.company_name} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80">Hotline</label>
                  <Input name="company_phone" className="bg-background text-foreground border-border" value={settings.company_phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80">Email hỗ trợ</label>
                  <Input name="company_email" className="bg-background text-foreground border-border" value={settings.company_email} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Địa chỉ trụ sở <MapPin className="inline h-4 w-4 text-red-500" /></label>
                <Input name="company_address" className="bg-background text-foreground border-border" value={settings.company_address} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Link nhúng bản đồ Google Maps (src iframe hoặc URL)</label>
                <Input name="company_map" className="bg-background text-foreground border-border" value={settings.company_map} onChange={handleChange} placeholder="https://www.google.com/maps/embed?pb=..." />
                <p className="text-[10px] text-muted-foreground mt-1">Copy phần link trong thuộc tính src của mã nhúng iframe Google Maps để hiển thị bản đồ ở chân trang web.</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2 text-foreground">
              <Share2 className="h-5 w-5 text-indigo-500" /> Mạng xã hội
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground/80">Facebook URL</label>
                  <button type="button" onClick={() => handleToggle('social_facebook_enabled')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.social_facebook_enabled === "true" ? 'bg-green-500' : 'bg-muted'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.social_facebook_enabled === "true" ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <Input name="social_facebook" className="bg-background text-foreground border-border" value={settings.social_facebook || ''} onChange={handleChange} placeholder="https://facebook.com/..." disabled={settings.social_facebook_enabled !== "true"} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground/80">YouTube URL</label>
                  <button type="button" onClick={() => handleToggle('social_youtube_enabled')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.social_youtube_enabled === "true" ? 'bg-green-500' : 'bg-muted'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.social_youtube_enabled === "true" ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <Input name="social_youtube" className="bg-background text-foreground border-border" value={settings.social_youtube || ''} onChange={handleChange} placeholder="https://youtube.com/..." disabled={settings.social_youtube_enabled !== "true"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-foreground/80">TikTok URL</label>
                    <button type="button" onClick={() => handleToggle('social_tiktok_enabled')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.social_tiktok_enabled === "true" ? 'bg-green-500' : 'bg-muted'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.social_tiktok_enabled === "true" ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <Input name="social_tiktok" className="bg-background text-foreground border-border" value={settings.social_tiktok || ''} onChange={handleChange} disabled={settings.social_tiktok_enabled !== "true"} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-foreground/80">Zalo Phone/URL</label>
                    <button type="button" onClick={() => handleToggle('social_zalo_enabled')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.social_zalo_enabled === "true" ? 'bg-green-500' : 'bg-muted'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.social_zalo_enabled === "true" ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <Input name="social_zalo" className="bg-background text-foreground border-border" value={settings.social_zalo || ''} onChange={handleChange} disabled={settings.social_zalo_enabled !== "true"} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Config */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2 text-foreground">
              <FileText className="h-5 w-5 text-amber-500" /> Chỉ số Thống kê
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80">Số năm kinh nghiệm</label>
                <Input name="stat_experience_years" className="bg-background text-foreground border-border mt-1" value={settings.stat_experience_years || ""} onChange={handleChange} placeholder="VD: 10+" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Số lượng khách hàng</label>
                <Input name="stat_happy_customers" className="bg-background text-foreground border-border mt-1" value={settings.stat_happy_customers || ""} onChange={handleChange} placeholder="VD: 15.000+" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Package className="h-4 w-4" /> Phí vận chuyển mặc định (Shop)
              </label>
              <Input type="number" name="shop_shipping_fee" className="bg-background text-foreground border-border mt-1 w-full sm:w-1/2" value={settings.shop_shipping_fee || ""} onChange={handleChange} placeholder="VD: 30000" />
              <p className="text-[10px] text-muted-foreground mt-1">Phí vận chuyển sẽ được áp dụng cho phương thức Giao hàng tận nơi.</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3"></p>
          </div>

          {/* Payment Gateways */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2 text-foreground">
              <CreditCard className="h-5 w-5 text-green-500" /> Quản lý Thanh toán
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'payment_vnpay_enabled', label: 'VNPay' },
                { id: 'payment_viettel_enabled', label: 'Viettel Money' },
                { id: 'payment_momo_enabled', label: 'MoMo' },
                { id: 'payment_cash_enabled', label: 'Tiền mặt / Chuyển khoản' },
              ].map(gateway => (
                <div key={gateway.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                  <span className="text-sm font-medium text-foreground">{gateway.label}</span>
                  <button
                    onClick={() => handleToggle(gateway.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[gateway.id as keyof typeof settings] === "true" ? 'bg-green-500' : 'bg-muted'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[gateway.id as keyof typeof settings] === "true" ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Static Pages CMS */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2 text-foreground">
              <FileText className="h-5 w-5 text-amber-500" /> Nội dung Trang tĩnh (HTML)
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Hỗ trợ viết nội dung bằng HTML. Sau này có thể cắm CKEditor vào đây.</p>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-foreground/90">Giới thiệu Công ty (Về chúng tôi)</label>
                <textarea
                  name="page_about"
                  value={settings.page_about}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 border border-border rounded-xl min-h-[100px] text-sm font-mono bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-foreground/90">Điều khoản dịch vụ</label>
                  <textarea
                    name="page_terms"
                    value={settings.page_terms}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-border rounded-xl min-h-[100px] text-sm font-mono bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground/90">Chính sách bảo mật</label>
                  <textarea
                    name="page_privacy"
                    value={settings.page_privacy}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-border rounded-xl min-h-[100px] text-sm font-mono bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
