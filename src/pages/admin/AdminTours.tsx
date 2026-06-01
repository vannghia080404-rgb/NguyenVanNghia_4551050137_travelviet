import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, Star, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTourForm from "@/components/admin/AdminTourForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getImageUrl } from "@/lib/utils";
import { adminTourAPIs } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Tour {
  id: number;
  name: string;
  slug: string;
  destination: { id: number; name: string };
  category: { id: number; name: string };
  duration: string;
  price: number;
  image: string;
  rating: number;
  reviews_count: number;
  status: string;
  description: string;
}

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Hoạt động", value: "active" },
  { label: "Không hoạt động", value: "inactive" },
  { label: "Nháp", value: "draft" },
];

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success",
  inactive: "bg-warning/15 text-warning",
  draft: "bg-secondary/15 text-muted-foreground",
};

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const AdminTours = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch tours
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-tours", filter, search],
    queryFn: async () => {
      const res = await adminTourAPIs.list({ status: filter, search });
      return res.data;
    },
  });

  const tours = response?.data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminTourAPIs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
      toast({ title: "Thành công", description: "Tour đã được xóa" });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa tour",
        variant: "destructive",
      });
    },
  });

  const openCreate = () => {
    setFormMode("create");
    setSelectedTour(null);
    setFormOpen(true);
  };

  const openEdit = (tour: Tour) => {
    setFormMode("edit");
    setSelectedTour(tour);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTour(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
    handleFormClose();
    toast({ title: "Thành công", description: formMode === "create" ? "Tour mới được thêm" : "Tour đã được cập nhật" });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Quản lý Tours" subtitle="Theo dõi và chỉnh sửa các tour du lịch của bạn">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Quản lý Tours"
      subtitle="Theo dõi và chỉnh sửa các tour du lịch của bạn"
      actions={
        <Button variant="hero" size="default" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm tour
        </Button>
      }
    >
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: "Tổng tours", value: tours.length || 0, color: "text-primary" },
          { label: "Hoạt động", value: tours.filter((t: Tour) => t.status === "active").length || 0, color: "text-success" },
          { label: "Không hoạt động", value: tours.filter((t: Tour) => t.status === "inactive").length || 0, color: "text-warning" },
          { label: "Nháp", value: tours.filter((t: Tour) => t.status === "draft").length || 0, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border/50 shadow-soft">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className={cn("font-display text-2xl font-bold mt-1", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-smooth",
                filter === s.value
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-muted-foreground hover:text-primary border border-border"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Input
          placeholder="Tìm kiếm tour..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tours Table */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-secondary/40">
                <th className="px-6 py-4 font-semibold">Tour</th>
                <th className="px-6 py-4 font-semibold">Điểm đến</th>
                <th className="px-6 py-4 font-semibold">Thời lượng</th>
                <th className="px-6 py-4 font-semibold">Giá</th>
                <th className="px-6 py-4 font-semibold">Đánh giá</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tours.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Không có tour nào
                  </td>
                </tr>
              ) : (
                tours.map((tour: Tour) => (
                  <tr key={tour.id} className="border-t border-border/50 hover:bg-secondary/20 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(tour.image)} alt={tour.name} className="h-12 w-16 rounded-lg object-cover" />
                        <div className="max-w-xs">
                          <div className="font-semibold text-foreground line-clamp-1">{tour.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{tour.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {tour.destination?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tour.duration}</td>
                    <td className="px-6 py-4 font-semibold">{formatPrice(tour.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{(parseFloat(String(tour.rating || 0)) || 0).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({tour.reviews_count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusColors[tour.status] || statusColors.draft)}>
                        {tour.status === "active" ? "Hoạt động" : tour.status === "inactive" ? "Không hoạt động" : "Nháp"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(tour)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-smooth"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {deleteConfirm === tour.id ? (
                          <>
                            <button
                              onClick={() => deleteMutation.mutate(tour.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 disabled:opacity-50"
                            >
                              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xóa"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium"
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(tour.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-smooth"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tour Form Modal */}
      <AdminTourForm
        open={formOpen}
        onClose={handleFormClose}
        mode={formMode}
        tour={selectedTour}
        onSuccess={handleFormSuccess}
      />
    </AdminLayout>
  );
};

export default AdminTours;
