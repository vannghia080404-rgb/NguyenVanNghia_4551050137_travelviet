import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Send, Users, User, Shield, Loader2, CheckCircle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const broadcastTypes = [
  { id: "all", label: "Tất cả người dùng", icon: Users, color: "bg-blue-500/10 text-blue-400 border-blue-500/30", description: "Gửi đến toàn bộ khách hàng đã đăng ký" },
  { id: "role", label: "Theo vai trò", icon: Shield, color: "bg-purple-500/10 text-purple-400 border-purple-500/30", description: "Chỉ gửi đến nhóm người dùng cụ thể" },
  { id: "individual", label: "Cá nhân", icon: User, color: "bg-amber-500/10 text-amber-400 border-amber-500/30", description: "Gửi đến một khách hàng cụ thể theo ID" },
];

const messageTemplates = [
  { label: "📢 Khuyến mãi", title: "Ưu đãi đặc biệt mùa hè!", message: "TravelViet tặng bạn mã giảm giá 15% cho tất cả tour từ nay đến cuối tháng. Áp dụng mã: SUMMER15" },
  { label: "🔧 Bảo trì", title: "Thông báo bảo trì hệ thống", message: "Hệ thống sẽ tạm ngưng bảo trì từ 00:00 - 02:00 ngày mai để nâng cấp. Chúng tôi xin lỗi vì sự bất tiện này." },
  { label: "✅ Chào mừng", title: "Chào mừng đến với TravelViet!", message: "Cảm ơn bạn đã tin tưởng lựa chọn TravelViet. Khám phá ngay hàng trăm tour hấp dẫn đang chờ đón bạn!" },
  { label: "⚠️ Thông báo quan trọng", title: "Thông báo quan trọng", message: "" },
];

export default function AdminBroadcast() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    message: "",
    broadcast_type: "all",
    target_user_id: "",
    target_role: "user",
  });

  const { data: history, isLoading } = useQuery({
    queryKey: ["broadcast-history"],
    queryFn: () => api.get("/admin/broadcast-notifications").then(r => r.data.data || []),
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/broadcast-notifications", data),
    onSuccess: (res) => {
      toast.success(`Đã gửi thành công đến ${res.data.recipients} người dùng!`);
      setForm({ title: "", message: "", broadcast_type: "all", target_user_id: "", target_role: "user" });
      queryClient.invalidateQueries({ queryKey: ["broadcast-history"] });
    },
    onError: () => toast.error("Gửi thông báo thất bại. Vui lòng thử lại."),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Vui lòng điền tiêu đề và nội dung thông báo");
      return;
    }
    sendMutation.mutate({
      title: form.title,
      message: form.message,
      broadcast_type: form.broadcast_type,
      target_user_id: form.broadcast_type === "individual" ? parseInt(form.target_user_id) : undefined,
      target_role: form.broadcast_type === "role" ? form.target_role : undefined,
    });
  };

  return (
    <AdminLayout title="Gửi Thông Báo">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Compose Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Soạn thông báo
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Gửi thông báo đến khách hàng theo từng nhóm mục tiêu</p>

            {/* Templates */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Mẫu nhanh</label>
              <div className="flex flex-wrap gap-2">
                {messageTemplates.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setForm(f => ({ ...f, title: t.title, message: t.message }))}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/20 text-foreground transition-colors font-medium border border-border/50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Broadcast Type */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-foreground/80 mb-2 block">Đối tượng nhận</label>
              <div className="grid grid-cols-3 gap-3">
                {broadcastTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setForm(f => ({ ...f, broadcast_type: type.id }))}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all bg-background text-foreground",
                      form.broadcast_type === type.id ? `${type.color} border-primary` : "border-border hover:border-border-hover"
                    )}
                  >
                    <type.icon className="h-5 w-5 mb-1" />
                    <div className="text-xs font-bold">{type.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional target */}
            {form.broadcast_type === "individual" && (
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground/80">ID Người dùng</label>
                <Input
                  className="mt-1.5 h-11 bg-background text-foreground border-border"
                  type="number"
                  placeholder="Nhập ID người dùng..."
                  value={form.target_user_id}
                  onChange={(e) => setForm(f => ({ ...f, target_user_id: e.target.value }))}
                />
              </div>
            )}
            {form.broadcast_type === "role" && (
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground/80">Vai trò</label>
                <select
                  value={form.target_role}
                  onChange={(e) => setForm(f => ({ ...f, target_role: e.target.value }))}
                  className="mt-1.5 w-full h-11 px-3 border border-border rounded-xl text-sm bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="user">Khách hàng (user)</option>
                  <option value="staff">Nhân viên (staff)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {/* Title + Message */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground/80">Tiêu đề thông báo <span className="text-red-500">*</span></label>
                <Input
                  className="mt-1.5 h-11 bg-background text-foreground border-border"
                  placeholder="Ví dụ: Ưu đãi mùa hè dành riêng cho bạn!"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground/80">Nội dung <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full mt-1.5 p-3 border border-border rounded-xl text-sm min-h-[120px] resize-none bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="Nội dung thông báo chi tiết..."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              size="lg"
              className="w-full mt-4 font-semibold text-white bg-primary hover:bg-primary/95"
            >
              {sendMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang gửi...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Gửi thông báo</>
              )}
            </Button>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft h-full">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Lịch sử gửi gần đây
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : history?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm">Chưa có thông báo nào được gửi</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {history?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-secondary/40 rounded-xl border border-border/50">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</div>
                        <div className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(item.sent_at), { addSuffix: true, locale: vi })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
