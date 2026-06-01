import { useState } from "react";
import { UserPlus, Mail, Trash2, Loader2, ChevronDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminUserAPIs } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  created_at: string;
  bookings_count?: number;
}

const roleOptions = [
  { value: "user", label: "Khách hàng" },
  { value: "staff", label: "Nhân viên" },
  { value: "admin", label: "Quản trị" },
];

const roleLabels: Record<string, string> = {
  user: "Khách hàng",
  staff: "Nhân viên",
  admin: "Quản trị"
};

const roleStyles: Record<string, string> = {
  user: "bg-secondary text-secondary-foreground",
  staff: "bg-blue-500/15 text-blue-400",
  admin: "bg-accent/15 text-accent",
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter, search],
    queryFn: async () => {
      const res = await adminUserAPIs.list({
        role: roleFilter,
        search,
      });
      return res.data;
    },
  });

  const users = response?.data?.data || [];

  // Update role mutation
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminUserAPIs.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Thành công", description: "Vai trò đã được cập nhật" });
      setExpandedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật vai trò",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminUserAPIs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Thành công", description: "Người dùng đã được xóa" });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa người dùng",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout
        title="Quản lý Người dùng"
        subtitle="Khách hàng, hướng dẫn viên và quản trị viên"
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    { label: "Tổng người dùng", value: users.length || 0 },
    { label: "Khách hàng", value: users.filter((u: User) => u.role === "user").length || 0 },
    { label: "Nhân viên", value: users.filter((u: User) => u.role === "staff").length || 0 },
    { label: "Quản trị", value: users.filter((u: User) => u.role === "admin").length || 0 },
  ];

  return (
    <AdminLayout
      title="Quản lý Người dùng"
      subtitle="Khách hàng và quản trị viên"
      actions={
        <Button variant="hero">
          <UserPlus className="h-4 w-4" /> Thêm người dùng
        </Button>
      }
    >
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
          >
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-bold text-primary mt-2">
              {s.value}
            </div>
          </div>
        ))}
      </section>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRoleFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth",
              roleFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:text-primary"
            )}
          >
            Tất cả
          </button>
          {roleOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth",
                roleFilter === r.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-primary"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <Input
          placeholder="Tìm kiếm tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-secondary/40">
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Tham gia</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr
                    key={user.id}
                    className="border-t border-border/50 hover:bg-secondary/20 transition-smooth"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Mail className="h-3.5 w-3.5" /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setExpandedRole(
                              expandedRole === user.id ? null : user.id
                            )
                          }
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max",
                            roleStyles[user.role] || roleStyles.user
                          )}
                        >
                          {roleLabels[user.role] || "Khách hàng"}
                          <ChevronDown className="h-3 w-3" />
                        </button>

                        {expandedRole === user.id && (
                          <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-max">
                            {roleOptions
                              .filter((r) => r.value !== user.role)
                              .map((r) => (
                                <button
                                  key={r.value}
                                  onClick={() => {
                                    roleMutation.mutate({
                                      id: user.id,
                                      role: r.value,
                                    });
                                  }}
                                  disabled={roleMutation.isPending}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
                                >
                                  {r.label}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              deleteMutation.mutate(user.id)
                            }
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Xóa"
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-smooth"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
