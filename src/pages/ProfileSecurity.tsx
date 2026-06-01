import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import ProfileLayout from "@/components/layout/ProfileLayout";

const ProfileSecurity = () => {
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePwMutation = useMutation({
    mutationFn: (data: typeof pwForm) => api.post("/auth/change-password", data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    },
  });

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current_password || !pwForm.new_password) return toast.error("Vui lòng điền đầy đủ");
    if (pwForm.new_password !== pwForm.new_password_confirmation) return toast.error("Mật khẩu xác nhận không khớp");
    if (pwForm.new_password.length < 6) return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    changePwMutation.mutate(pwForm);
  };

  return (
    <ProfileLayout title="Bảo mật">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="font-display text-xl font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">Đổi mật khẩu</h2>
        <p className="text-sm text-gray-500 mb-6">Bảo vệ tài khoản của bạn bằng một mật khẩu mạnh (ít nhất 6 ký tự).</p>
        
        <form onSubmit={handlePwSubmit} className="max-w-md">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 pr-10 h-12"
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrent((v) => !v)}>
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Mật khẩu mới <span className="text-red-500">*</span></label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 pr-10 h-12"
                  type={showNew ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNew((v) => !v)}>
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 pr-10 h-12"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={pwForm.new_password_confirmation}
                  onChange={(e) => setPwForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwForm.new_password && pwForm.new_password_confirmation && pwForm.new_password !== pwForm.new_password_confirmation && (
                <p className="mt-2 text-xs text-red-500 font-medium">Mật khẩu xác nhận không khớp</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Button
              type="submit"
              size="lg"
              disabled={changePwMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12"
            >
              {changePwMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang lưu...</>
              ) : (
                <><ShieldCheck className="h-4 w-4 mr-2" /> Đổi mật khẩu</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProfileLayout>
  );
};

export default ProfileSecurity;
