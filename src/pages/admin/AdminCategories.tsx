import { useState } from "react";
import { Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tours_count: number;
}

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Fetch categories
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get("/admin/categories").then(r => r.data),
  });

  const categories: Category[] = response?.data || [];
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Create
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-list"] });
      toast({ title: "Thành công", description: "Đã tạo danh mục mới" });
      setIsModalOpen(false);
    },
    onError: (e: any) => {
      toast({ title: "Lỗi", description: e.response?.data?.message || "Lỗi tạo danh mục", variant: "destructive" });
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/categories/${editingCategory?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-list"] });
      toast({ title: "Thành công", description: "Đã cập nhật danh mục" });
      setIsModalOpen(false);
    },
    onError: (e: any) => {
      toast({ title: "Lỗi", description: e.response?.data?.message || "Lỗi cập nhật", variant: "destructive" });
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-list"] });
      toast({ title: "Thành công", description: "Đã xóa danh mục" });
      setDeleteConfirm(null);
    },
    onError: (e: any) => {
      toast({ title: "Lỗi", description: e.response?.data?.message || "Lỗi xóa", variant: "destructive" });
      setDeleteConfirm(null);
    },
  });

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Lỗi", description: "Tên danh mục không được để trống", variant: "destructive" });
      return;
    }
    if (editingCategory) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const CATEGORY_ICONS: Record<string, string> = {
    "Khám phá": "🧭",
    "Văn hoá": "🏛️",
    "Biển đảo": "🏖️",
    "Trekking": "⛰️",
    "Ẩm thực": "🍜",
    "Sinh thái": "🌿",
  };

  return (
    <AdminLayout
      title="Quản lý Danh Mục Tour"
      subtitle="Phân loại các tour du lịch theo chủ đề"
      actions={
        <Button variant="hero" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-soft">
          <div className="text-sm text-muted-foreground">Tổng danh mục</div>
          <div className="font-display text-3xl font-bold text-primary mt-1">{categories.length}</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-soft">
          <div className="text-sm text-muted-foreground">Tổng tour đã phân loại</div>
          <div className="font-display text-3xl font-bold text-accent mt-1">
            {categories.reduce((sum, c) => sum + (c.tours_count || 0), 0)}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-soft">
          <div className="text-sm text-muted-foreground">TB tour / danh mục</div>
          <div className="font-display text-3xl font-bold text-success mt-1">
            {categories.length > 0
              ? (categories.reduce((sum, c) => sum + (c.tours_count || 0), 0) / categories.length).toFixed(1)
              : "0"}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Grid of category cards */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {search ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-soft hover:shadow-md transition-all hover:border-primary/30 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {CATEGORY_ICONS[cat.name] || "🏷️"}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-smooth"
                    title="Sửa"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  {deleteConfirm === cat.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(cat.id)}
                        disabled={deleteMutation.isPending}
                        className="px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium"
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Xóa"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-smooth"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-foreground text-base">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
                {cat.description || "Chưa có mô tả"}
              </p>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Slug: <code className="text-primary font-mono">{cat.slug}</code></span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {cat.tours_count || 0} tour
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Sửa Danh Mục" : "Tạo Danh Mục Mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên danh mục (*)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Biển đảo, Trekking, Văn hoá..."
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả (Tùy chọn)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về danh mục tour này..."
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Slug sẽ tự động được tạo từ tên danh mục (dùng cho URL và lọc tour).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
