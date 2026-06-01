import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Users, GripVertical, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  bio?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
};

const emptyForm = { name: "", role: "", bio: "", sort_order: 0 };

export default function AdminTeamMembers() {
  const queryClient = useQueryClient();
  const imgRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: () => api.get("/admin/team-members").then(r => r.data.data as TeamMember[]),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { form: typeof emptyForm; id?: number }) => {
      const fd = new FormData();
      Object.entries(data.form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("image", imageFile);
      if (data.id) {
        fd.append("_method", "PUT");
        return api.post(`/admin/team-members/${data.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      return api.post("/admin/team-members", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success(editingId === "new" ? "Đã thêm thành viên mới!" : "Đã cập nhật thành viên!");
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      resetForm();
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/team-members/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa thành viên");
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setForm({ name: m.name, role: m.role, bio: m.bio || "", sort_order: m.sort_order });
    setImagePreview(m.image_url ? `http://localhost:8000${m.image_url}` : null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) return toast.error("Vui lòng điền tên và chức vụ");
    saveMutation.mutate({ form, id: editingId !== "new" ? (editingId as number) : undefined });
  };

  return (
    <AdminLayout title="Quản lý Đội ngũ">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft sticky top-6">
            <h3 className="font-display font-bold text-foreground mb-5">
              {editingId === null ? "Thêm thành viên" : editingId === "new" ? "Thêm mới" : "Chỉnh sửa"}
            </h3>

            {/* Image upload */}
            <div className="mb-5 flex flex-col items-center">
              <div
                onClick={() => imgRef.current?.click()}
                className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-dashed border-border hover:border-primary bg-background flex items-center justify-center cursor-pointer transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} className="h-full w-full object-cover" alt="preview" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImagePlus className="h-8 w-8 mx-auto mb-1 text-muted-foreground/60" />
                    <span className="text-xs">Tải ảnh lên</span>
                  </div>
                )}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <p className="text-xs text-muted-foreground mt-2">Ảnh JPG/PNG, tối đa 2MB</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground/80">Họ và tên <span className="text-red-500">*</span></label>
                <Input className="mt-1.5 h-11 bg-background text-foreground border-border" placeholder="Nguyễn Văn A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground/80">Chức vụ <span className="text-red-500">*</span></label>
                <Input className="mt-1.5 h-11 bg-background text-foreground border-border" placeholder="Founder & CEO" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground/80">Giới thiệu ngắn</label>
                <textarea className="w-full mt-1.5 p-3 border border-border bg-background text-foreground rounded-xl text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" rows={3} placeholder="Mô tả về thành viên..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground/80">Thứ tự hiển thị</label>
                <Input className="mt-1.5 h-11 bg-background text-foreground border-border" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              {editingId !== null && (
                <Button variant="outline" onClick={resetForm} className="flex-1">Hủy</Button>
              )}
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 text-white bg-primary hover:bg-primary/95">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId === "new" || editingId !== null ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </div>

            {editingId === null && (
              <Button variant="outline" className="w-full mt-2" onClick={() => setEditingId("new")}>
                <Plus className="h-4 w-4 mr-1" /> Thêm thành viên
              </Button>
            )}
          </div>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Danh sách đội ngũ ({data?.length || 0} thành viên)
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : data?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto opacity-20 mb-3" />
                <p>Chưa có thành viên nào. Thêm thành viên đầu tiên!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {data?.map(member => (
                  <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-secondary/40 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-background shrink-0 border border-border/50">
                      {member.image_url ? (
                        <img src={`http://localhost:8000${member.image_url}`} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground font-bold text-xl bg-secondary/50">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{member.name}</div>
                      <div className="text-sm text-primary font-medium">{member.role}</div>
                      {member.bio && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{member.bio}</div>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(member)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Xóa ${member.name}?`)) deleteMutation.mutate(member.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
