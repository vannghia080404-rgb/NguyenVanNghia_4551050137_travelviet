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
    code: "", title: "", description: "", scope: "shop", discount_type: "fixed", 
    discount_value: "", min_order_value: "0", min_quantity: "", max_discount: "", 
    applies_to: "all", target_ids: [], valid_from: "", valid_to: "", 
    usage_limit: "", user_limit: "1", is_public: true, is_active: true
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
        target_ids: voucher.target_ids || [],
      });
      setIsEditing(true);
    } else {
      setFormData({
        code: "", title: "", description: "", scope: "shop", discount_type: "fixed", 
        discount_value: "", min_order_value: "0", min_quantity: "", max_discount: "", 
        applies_to: "all", target_ids: [], valid_from: "", valid_to: "", 
        usage_limit: "", user_limit: "1", is_public: true, is_active: true
      });
      setIsEditing(false);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    if (!data.min_quantity) data.min_quantity = null;
    if (!data.max_discount) data.max_discount = null;
    if (!data.usage_limit) data.usage_limit = null;
    mutation.mutate(data);
  };

  return (
    <AdminLayout title="Quản lý Mã giảm giá">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" /> Quản lý Khuyến mãi (Vouchers)
        </h1>
        <Button onClick={() => handleOpen()}><Plus className="h-4 w-4 mr-2" /> Thêm Mã Mới</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 font-medium">
            <tr>
              <th className="px-4 py-3">Phạm vi</th>
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
              <tr><td colSpan={7} className="text-center py-4">Đang tải...</td></tr>
            ) : vouchers?.map((v: any) => (
              <tr key={v.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold uppercase">{v.scope}</span>
                </td>
                <td className="px-4 py-3 font-bold text-primary">{v.code}</td>
                <td className="px-4 py-3">
                  {v.discount_type === 'percent' ? `${v.discount_value}%` : (v.discount_type === 'free_shipping' ? 'Freeship' : `${new Intl.NumberFormat('vi-VN').format(v.discount_value)}đ`)}
                </td>
                <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(v.min_order_value)}đ</td>
                <td className="px-4 py-3">{v.used_count} / {v.usage_limit || '∞'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Switch checked={v.is_active} disabled />
                    {v.is_public ? <span className="text-xs text-green-500 font-semibold border border-green-200 bg-green-50 px-1 rounded">Public</span> : <span className="text-xs text-slate-500 font-semibold border px-1 rounded">Private</span>}
                  </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Cập nhật Mã giảm giá" : "Thêm Mã giảm giá mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Mã CODE</label>
                <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: TET2026" className="uppercase" />
              </div>
              <div>
                <label className="text-sm font-medium">Tiêu đề (Hiển thị cho khách)</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Giảm 50K cho đơn 200K" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phạm vi áp dụng</label>
                <Select value={formData.scope} onValueChange={v => setFormData({...formData, scope: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop">Chỉ Cửa hàng (Shop)</SelectItem>
                    <SelectItem value="tour">Chỉ Đặt Tour (Tour)</SelectItem>
                    <SelectItem value="all">Toàn hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Đối tượng áp dụng</label>
                <Select value={formData.applies_to} onValueChange={v => setFormData({...formData, applies_to: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả sản phẩm/tours</SelectItem>
                    <SelectItem value="specific_categories">Danh mục cụ thể (Sắp tới)</SelectItem>
                    <SelectItem value="specific_products">Sản phẩm cụ thể (Sắp tới)</SelectItem>
                    <SelectItem value="specific_tours">Tour cụ thể (Sắp tới)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Loại giảm giá</label>
                <Select value={formData.discount_type} onValueChange={v => setFormData({...formData, discount_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="free_shipping">Miễn phí vận chuyển (Freeship)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Mức giảm</label>
                <Input type="number" required={formData.discount_type !== 'free_shipping'} value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} disabled={formData.discount_type === 'free_shipping'} placeholder={formData.discount_type === 'percent' ? '%' : 'VNĐ'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Đơn tối thiểu (VNĐ)</label>
                <Input type="number" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Giảm tối đa (VNĐ)</label>
                <Input type="number" value={formData.max_discount} onChange={e => setFormData({...formData, max_discount: e.target.value})} placeholder="Không giới hạn" disabled={formData.discount_type === 'fixed' || formData.discount_type === 'free_shipping'} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Số lượng mua tối thiểu (VD: mua 2)</label>
                <Input type="number" value={formData.min_quantity} onChange={e => setFormData({...formData, min_quantity: e.target.value})} placeholder="Không yêu cầu" />
              </div>
              <div>
                <label className="text-sm font-medium">Mỗi khách được dùng tối đa</label>
                <Input type="number" value={formData.user_limit} onChange={e => setFormData({...formData, user_limit: e.target.value})} />
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

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="text-sm font-medium block">Tổng mã phát hành</label>
                <Input type="number" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} placeholder="Để trống = vô hạn" className="w-40" />
              </div>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_public} onCheckedChange={c => setFormData({...formData, is_public: c})} />
                  <span className="text-sm font-medium">Public (Khách có thể Săn)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c})} />
                  <span className="text-sm font-medium">Kích hoạt</span>
                </div>
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
