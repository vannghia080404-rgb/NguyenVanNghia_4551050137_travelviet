import { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, Save, Loader2, Camera, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { validateImageFile } from "@/lib/utils";

// Compute member tier based on total spending
function getMemberTier(totalSpent: number = 0) {
  if (totalSpent >= 100_000_000) return { label: "Hạng Kim Cương 💎", color: "bg-cyan-100 text-cyan-700", borderColor: "border-cyan-300", nextLevel: null, required: 0 };
  if (totalSpent >= 50_000_000)  return { label: "Hạng Vàng 🥇", color: "bg-yellow-100 text-yellow-700", borderColor: "border-yellow-300", nextLevel: "Kim Cương", required: 100_000_000 };
  if (totalSpent >= 10_000_000)  return { label: "Hạng Bạc 🥈", color: "bg-gray-100 text-gray-700", borderColor: "border-gray-300", nextLevel: "Vàng", required: 50_000_000 };
  return { label: "Hạng Đồng 🥉", color: "bg-orange-50 text-orange-700", borderColor: "border-orange-200", nextLevel: "Bạc", required: 10_000_000 };
}

const Profile = () => {
  const { user, setUser, isLoading } = useAuthStore();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  // Disable avatar upload while auth is still initializing or user is not ready
  const canUpload = !isLoading && !!user;

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bank_name: user?.bank_name || "",
    bank_account_no: user?.bank_account_no || "",
    bank_account_name: user?.bank_account_name || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profileForm) => api.put("/auth/profile", data),
    onSuccess: (res) => {
      setUser(res.data.data);
      toast.success("Cập nhật thông tin thành công!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canUpload) return;
    
    const { valid, error } = validateImageFile(file);
    if (!valid) {
      toast.error(error);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarUploading(true);
    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data);
      toast.success("Ảnh đại diện đã được cập nhật!");
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error("Vui lòng nhập họ tên");
    updateProfileMutation.mutate(profileForm);
  };

  if (!user) return null;

  const tier = getMemberTier((user as any).total_spent);
  const getImageUrl = (source?: string | null) => {
    if (!source) return null;
    if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('data:') || source.startsWith('blob:')) return source;
    if (source.startsWith('/storage')) return `http://localhost:8000${source}`;
    // Trình duyệt không thể render đường dẫn ổ cứng (C:\...), trả về null để hiện chữ cái đầu
    if (source.includes(':\\')) return null; 
    return source;
  };

  const avatarUrl = getImageUrl(user.avatar);

  return (
    <ProfileLayout title="Thông tin cá nhân">
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with upload */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading || !canUpload}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-display font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tier.color} ${tier.borderColor} shadow-sm`}>
                  {tier.label}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {user.role === 'admin' ? '🛡️ Quản trị viên' : user.role === 'staff' ? '👷 Nhân viên' : '👤 Khách hàng'}
                </span>
              </div>
              
              {/* Progress Bar for Ranking */}
              <div className="mt-4 max-w-sm">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                  <span>Tổng chi tiêu: <strong className="text-primary">{new Intl.NumberFormat('vi-VN').format((user as any).total_spent || 0)}đ</strong></span>
                  {tier.nextLevel && <span>Lên {tier.nextLevel}: {new Intl.NumberFormat('vi-VN').format(tier.required)}đ</span>}
                </div>
                {tier.nextLevel && (
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (((user as any).total_spent || 0) / tier.required) * 100)}%` }} 
                    />
                  </div>
                )}
              </div>
              
              <p className="text-[11px] text-gray-400 mt-3 italic">* Nhấp vào biểu tượng máy ảnh để thay đổi ảnh đại diện</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Thông tin cơ bản</h3>
          <form onSubmit={handleProfileSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                <div className="mt-2 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 h-12"
                    placeholder="Nguyễn Văn A"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input className="pl-10 h-12 bg-gray-50 text-gray-500 cursor-not-allowed" value={user.email} readOnly />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                <div className="mt-2 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 h-12"
                    placeholder="0912 345 678"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Địa chỉ</label>
                <div className="mt-2 relative">
                  <MapPin className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                  <textarea
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    rows={3}
                    placeholder="123 Đường ABC, Phường XYZ, TP. Hồ Chí Minh"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-gray-900 mt-10 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Thông tin ngân hàng (Dùng để hoàn tiền)
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Tên Ngân hàng / Ví điện tử</label>
                <div className="mt-2 relative">
                  <Input
                    className="h-12"
                    placeholder="VD: Vietcombank, Momo, MB Bank..."
                    value={profileForm.bank_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bank_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Số tài khoản</label>
                <div className="mt-2 relative">
                  <Input
                    className="h-12"
                    placeholder="VD: 0123456789"
                    value={profileForm.bank_account_no}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bank_account_no: e.target.value }))}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Tên chủ tài khoản</label>
                <div className="mt-2 relative">
                  <Input
                    className="h-12 uppercase"
                    placeholder="VD: NGUYEN VAN A"
                    value={profileForm.bank_account_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bank_account_name: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={updateProfileMutation.isPending}
                className="min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12"
              >
                {updateProfileMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang lưu...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Lưu thay đổi</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
