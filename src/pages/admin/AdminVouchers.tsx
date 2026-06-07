import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function AdminVouchers() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    code: "",
    discount_type: "fixed",
    discount_value: "",
    min_order_value: "0",
    max_discount: "",
    valid_from: "",
    valid_to: "",
    usage_limit: "",
    is_active: true
  });

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: () => api.get("/admin/vouchers").then(res => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => 
      isEditing 
        ? api.put(`/admin/vouchers/${data.id}`, data)
        : api.post("/admin/vouchers", data),
    onSuccess: () => {
      toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      setIsOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Có lỗi xảy ra!")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/vouchers/${id}`),
    onSuccess: () => {
      toast.success("Xóa mã giảm giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    }
  });

  const handleOpen = (voucher: any = null) => {
    if (voucher) {
      setFormData({
        ...voucher,
        valid_from: voucher.valid_from ? new Date(voucher.valid_from).toISOString().split('T')[0] : "",
        valid_to: voucher.valid_to ? new Date(voucher.valid_to).toISOString().split('T')[0] : "",
      });
      setIsEditing(true);
    } else {
      setFormData({
        code: "", discount_type: "fixed", discount_value: "", min_order_value: "0", 
        max_discount: "", valid_from: "", valid_to: "", usage_limit: "", is_active: true
      });
      setIsEditing(false);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <AdminLayout title="Quản lý Mã giảm giá">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" /> Mã giảm giá Shop
        </h1>
        <Button onClick={() => handleOpen()}><Plus className="h-4 w-4 mr-2" /> Thêm Mã Mới</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 font-medium">
            <tr>
              <th className="px-4 py-3">Mã giảm giá</th>
              <th className="px-4 py-3">Loại / Giá trị</th>
              <th className="px-4 py-3">Đơn tối thiểu</th>
              <th className="px-4 py-3">Đã dùng / Giới hạn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
            ) : vouchers?.map((v: any) => (
              <tr key={v.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-bold text-primary">{v.code}</td>
                <td className="px-4 py-3">
                  {v.discount_type === 'percent' ? `${v.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(v.discount_value)}đ`}
                </td>
                <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(v.min_order_value)}đ</td>
                <td className="px-4 py-3">{v.used_count} / {v.usage_limit || '∞'}</td>
                <td className="px-4 py-3">
                  <Switch checked={v.is_active} disabled />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpen(v)}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Bạn có chắc muốn xóa mã này?")) deleteMutation.mutate(v.id);
                  }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Cập nhật Mã giảm giá" : "Thêm Mã giảm giá mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mã CODE</label>
              <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: TET2026" className="uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Loại giảm giá</label>
                <Select value={formData.discount_type} onValueChange={v => setFormData({...formData, discount_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Mức giảm</label>
                <Input type="number" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder={formData.discount_type === 'percent' ? '%' : 'VNĐ'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Đơn tối thiểu (VNĐ)</label>
                <Input type="number" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Giảm tối đa (VNĐ)</label>
                <Input type="number" value={formData.max_discount} onChange={e => setFormData({...formData, max_discount: e.target.value})} placeholder="Không giới hạn" disabled={formData.discount_type === 'fixed'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Từ ngày (tùy chọn)</label>
                <Input type="date" value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Đến ngày (tùy chọn)</label>
                <Input type="date" value={formData.valid_to} onChange={e => setFormData({...formData, valid_to: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium block">Số lượng mã</label>
                <Input type="number" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} placeholder="Để trống = vô hạn" className="w-40" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c})} />
                <span className="text-sm font-medium">Kích hoạt</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
