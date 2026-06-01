import { useState, useEffect } from "react";
import { Save, User, Lock, Upload, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { getImageUrl } from "@/lib/utils";

export default function AdminProfile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (formData.new_password && formData.new_password !== formData.new_password_confirmation) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Create payload (only send password fields if user is trying to change it)
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.new_password) {
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
        payload.new_password_confirmation = formData.new_password_confirmation;
      }

      const res = await api.put("/auth/profile", payload);
      setUser(res.data.data);
      toast.success("Cập nhật hồ sơ thành công!");
      
      // Clear password fields after success
      if (formData.new_password) {
        setFormData(prev => ({
          ...prev,
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('avatar', file);
    
    setAvatarUploading(true);
    try {
      const res = await api.post('/auth/avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err: any) {
      toast.error("Không thể tải ảnh lên!");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <AdminLayout
      title="Hồ sơ quản trị"
      subtitle="Quản lý thông tin cá nhân và bảo mật tài khoản admin"
    >
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Avatar Section */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col items-center text-center space-y-4">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md">
            {user?.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-display font-bold">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-smooth">
              {avatarUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Thay đổi</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
                </>
              )}
            </label>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Shield className="h-3.5 w-3.5" />
              {user?.role === "admin" ? "Quản trị viên" : "Super Admin"}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-display font-semibold text-lg border-b border-border pb-2">
                  <User className="h-5 w-5 text-primary" />
                  Thông tin cơ bản
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (Không thể thay đổi)</label>
                  <Input value={user?.email || ""} disabled className="bg-secondary/50 opacity-70" />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="flex items-center gap-2 font-display font-semibold text-lg border-b border-border pb-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Đổi mật khẩu (Bỏ trống nếu không đổi)
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                    <Input type="password" name="current_password" value={formData.current_password} onChange={handleInputChange} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mật khẩu mới</label>
                      <Input type="password" name="new_password" value={formData.new_password} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                      <Input type="password" name="new_password_confirmation" value={formData.new_password_confirmation} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-secondary/30 border-t border-border flex justify-end">
              <Button type="submit" variant="hero" disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
