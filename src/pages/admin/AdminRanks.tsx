import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { loyaltyAPIs } from "@/lib/api";
import { Loader2, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function AdminRanks() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    min_spending: "",
    discount_percent: ""
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-ranks"],
    queryFn: async () => {
      const res = await loyaltyAPIs.getRanks();
      return res.data;
    }
  });

  const ranks = response || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => loyaltyAPIs.createRank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ranks"] });
      toast({ title: "Thành công", description: "Đã thêm hạng thẻ mới" });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => loyaltyAPIs.updateRank(editingRank.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ranks"] });
      toast({ title: "Thành công", description: "Đã cập nhật hạng thẻ" });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => loyaltyAPIs.deleteRank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ranks"] });
      toast({ title: "Thành công", description: "Đã xóa hạng thẻ" });
    }
  });

  const handleOpenCreate = () => {
    setEditingRank(null);
    setFormData({ name: "", min_spending: "", discount_percent: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rank: any) => {
    setEditingRank(rank);
    setFormData({
      name: rank.name,
      min_spending: rank.min_spending.toString(),
      discount_percent: rank.discount_percent.toString()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.min_spending || !formData.discount_percent) {
      toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin", variant: "destructive" });
      return;
    }

    const dataToSend = {
      name: formData.name,
      min_spending: parseFloat(formData.min_spending),
      discount_percent: parseFloat(formData.discount_percent)
    };

    if (editingRank) {
      updateMutation.mutate(dataToSend);
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  return (
    <AdminLayout title="Quản lý Hạng Thành Viên">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Thiết lập các mốc chi tiêu và quyền lợi cho khách hàng thân thiết.</p>
          <Button onClick={handleOpenCreate}>+ Thêm Hạng Mới</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 border-b border-border/50 text-muted-foreground text-sm">
                <tr>
                  <th className="p-4 font-medium">Hạng thẻ</th>
                  <th className="p-4 font-medium">Chi tiêu tối thiểu</th>
                  <th className="p-4 font-medium">Giảm giá mặc định</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {ranks.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chưa có hạng thẻ nào</td></tr>
                ) : ranks.map((rank: any) => (
                  <tr key={rank.id} className="hover:bg-secondary/10">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <Crown className="w-4 h-4 text-amber-500" /> {rank.name}
                      </div>
                    </td>
                    <td className="p-4">{new Intl.NumberFormat('vi-VN').format(rank.min_spending)} ₫</td>
                    <td className="p-4 text-success font-bold">{rank.discount_percent}%</td>
                    <td className="p-4 text-right">
                      <button className="text-primary text-sm font-medium hover:underline mr-3" onClick={() => handleOpenEdit(rank)}>Sửa</button>
                      <button className="text-destructive text-sm font-medium hover:underline" onClick={() => {
                        if (window.confirm("Bạn có chắc chắn muốn xóa?")) deleteMutation.mutate(rank.id);
                      }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingRank ? "Sửa Hạng Thẻ" : "Thêm Hạng Mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên Hạng (VD: Vàng, Bạc...)</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: Kim Cương"
              />
            </div>
            <div className="grid gap-2">
              <Label>Chi tiêu tối thiểu (VNĐ)</Label>
              <Input 
                type="number"
                value={formData.min_spending} 
                onChange={(e) => setFormData({...formData, min_spending: e.target.value})} 
                placeholder="VD: 50000000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Giảm giá mặc định (%)</Label>
              <Input 
                type="number"
                value={formData.discount_percent} 
                onChange={(e) => setFormData({...formData, discount_percent: e.target.value})} 
                placeholder="VD: 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
