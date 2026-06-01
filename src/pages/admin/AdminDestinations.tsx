import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, Loader2, Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDestinationForm from "@/components/admin/AdminDestinationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Destination {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  title: string;
  color: string;
  tours_count: number;
}

const AdminDestinations = () => {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch destinations
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-destinations"],
    queryFn: async () => {
      const res = await api.get("/admin/destinations");
      return res.data;
    },
  });

  const destinations = response?.data || [];
  const filteredDestinations = destinations.filter((d: Destination) => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/destinations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
      toast({ title: "Thành công", description: "Điểm đến đã được xóa" });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa điểm đến",
        variant: "destructive",
      });
    },
  });

  const openCreate = () => {
    setFormMode("create");
    setSelectedDestination(null);
    setFormOpen(true);
  };

  const openEdit = (dest: Destination) => {
    setFormMode("edit");
    setSelectedDestination(dest);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedDestination(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
    handleFormClose();
    toast({ 
      title: "Thành công", 
      description: formMode === "create" ? "Điểm đến mới được thêm" : "Điểm đến đã được cập nhật" 
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Quản lý điểm đến" subtitle="Quản lý các địa danh du lịch trên hệ thống">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Quản lý điểm đến"
      subtitle="Quản lý các địa danh du lịch trên hệ thống"
      actions={
        <Button variant="hero" size="default" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm điểm đến
        </Button>
      }
    >
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        {[
          { label: "Tổng số điểm đến", value: destinations.length || 0, color: "text-primary" },
          { label: "Trung bình tour/điểm đến", value: (destinations.reduce((acc: number, curr: Destination) => acc + (curr.tours_count || 0), 0) / (destinations.length || 1)).toFixed(1), color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border/50 shadow-soft">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className={cn("font-display text-2xl font-bold mt-1", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <Input
          placeholder="Tìm kiếm điểm đến..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm rounded-xl"
        />
      </div>

      {/* Destinations Table */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-secondary/40">
                <th className="px-6 py-4 font-semibold">Hình ảnh & Tên</th>
                <th className="px-6 py-4 font-semibold">Tiêu đề phụ</th>
                <th className="px-6 py-4 font-semibold">Mô tả</th>
                <th className="px-6 py-4 font-semibold">Số Tour</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredDestinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Không tìm thấy điểm đến nào
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((dest: Destination) => (
                  <tr key={dest.id} className="border-t border-border/50 hover:bg-secondary/20 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                          {dest.image ? (
                            <img src={dest.image} alt={dest.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="font-semibold text-foreground">{dest.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[150px] truncate">{dest.title || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{dest.description || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-primary">
                        <MapPin className="h-3.5 w-3.5" /> {dest.tours_count || 0} tour
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(dest)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-smooth"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {deleteConfirm === dest.id ? (
                          <>
                            <button
                              onClick={() => deleteMutation.mutate(dest.id)}
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
                            onClick={() => setDeleteConfirm(dest.id)}
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

      <AdminDestinationForm
        open={formOpen}
        onClose={handleFormClose}
        mode={formMode}
        destination={selectedDestination}
        onSuccess={handleFormSuccess}
      />
    </AdminLayout>
  );
};

export default AdminDestinations;
