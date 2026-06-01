import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import api, { loyaltyAPIs } from "@/lib/api";
import { Loader2, Gift, ToggleRight, ToggleLeft, CheckSquare, Square, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPromotions() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "" as string | File,
    discount_type: "percent",
    discount_value: "",
    is_featured: false,
    status: "active",
    required_rank_id: "none",
    target_tour_ids: [] as number[],
    start_date: "",
    end_date: "",
    badge: ""
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const res = await loyaltyAPIs.getPromotions();
      return res.data;
    }
  });

  const { data: ranksResponse } = useQuery({
    queryKey: ["admin-ranks"],
    queryFn: async () => {
      const res = await loyaltyAPIs.getRanks();
      return res.data;
    }
  });

  const { data: toursResponse } = useQuery({
    queryKey: ["admin-tours-list"],
    queryFn: async () => {
      const res = await api.get('/tours?per_page=100');
      return res.data;
    }
  });

  const promotions = response || [];
  const ranks = ranksResponse || [];
  const toursList = toursResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => loyaltyAPIs.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "Thành công", description: "Đã tạo khuyến mãi mới" });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => loyaltyAPIs.updatePromotion(editingPromo.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "Thành công", description: "Đã cập nhật khuyến mãi" });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => loyaltyAPIs.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "Thành công", description: "Đã xóa khuyến mãi" });
    }
  });

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      discount_type: "percent",
      discount_value: "",
      is_featured: false,
      status: "active",
      required_rank_id: "none",
      target_tour_ids: [],
      start_date: "",
      end_date: "",
      badge: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: any) => {
    setEditingPromo(promo);
    
    // Parse target_url to extract ids if it exists
    let extractedIds: number[] = [];
    if (promo.target_url && promo.target_url.includes('ids=')) {
      const match = promo.target_url.match(/ids=([\d,]+)/);
      if (match && match[1]) {
        extractedIds = match[1].split(',').map((id: string) => parseInt(id));
      }
    }

    setFormData({
      title: promo.title,
      description: promo.description || "",
      image: promo.image || "",
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      is_featured: promo.is_featured,
      status: promo.status,
      required_rank_id: promo.required_rank_id ? promo.required_rank_id.toString() : "none",
      target_tour_ids: extractedIds,
      start_date: promo.start_date ? new Date(promo.start_date).toISOString().split('T')[0] : "",
      end_date: promo.end_date ? new Date(promo.end_date).toISOString().split('T')[0] : "",
      badge: promo.badge || ""
    });
    setIsModalOpen(true);
  };

  const toggleTourSelection = (tourId: number) => {
    setFormData(prev => {
      const currentIds = [...prev.target_tour_ids];
      const index = currentIds.indexOf(tourId);
      if (index === -1) {
        currentIds.push(tourId);
      } else {
        currentIds.splice(index, 1);
      }
      return { ...prev, target_tour_ids: currentIds };
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.discount_value) {
      toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description || "");
    submitData.append('discount_type', formData.discount_type);
    submitData.append('discount_value', formData.discount_value);
    submitData.append('is_featured', formData.is_featured ? "1" : "0");
    submitData.append('status', formData.status);
    
    if (formData.required_rank_id !== "none") {
      submitData.append('required_rank_id', formData.required_rank_id);
    }
    
    if (formData.start_date) submitData.append('start_date', formData.start_date);
    if (formData.end_date) submitData.append('end_date', formData.end_date);
    if (formData.badge) submitData.append('badge', formData.badge);
    
    if (formData.target_tour_ids.length > 0) {
      submitData.append('target_url', `/tours?ids=${formData.target_tour_ids.join(',')}`);
    }

    if (formData.image instanceof File) {
      submitData.append('image', formData.image);
    } else if (typeof formData.image === 'string' && formData.image) {
      submitData.append('image', formData.image);
    }

    if (editingPromo) {
      submitData.append('_method', 'PUT');
      // In Axios, if we send FormData via PUT, it might fail in PHP, so we use POST with _method=PUT
      api.post(`/admin/promotions/${editingPromo.id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(() => {
        toast({ title: "Thành công", description: "Đã cập nhật khuyến mãi" });
        queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
        setIsModalOpen(false);
      }).catch((e) => {
        toast({ title: "Lỗi", description: e.response?.data?.message || "Lỗi cập nhật", variant: "destructive" });
      });
    } else {
      api.post('/admin/promotions', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(() => {
        toast({ title: "Thành công", description: "Đã tạo khuyến mãi mới" });
        queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
        setIsModalOpen(false);
      }).catch((e) => {
        toast({ title: "Lỗi", description: e.response?.data?.message || "Lỗi tạo khuyến mãi", variant: "destructive" });
      });
    }
  };

  return (
    <AdminLayout title="Quản lý Khuyến Mãi">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Cài đặt các chương trình Sale, Ưu đãi cho từng hạng thành viên.</p>
          <Button onClick={handleOpenCreate}>+ Tạo Khuyến Mãi</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {promotions.length === 0 ? (
              <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl text-muted-foreground">
                Chưa có chương trình khuyến mãi nào
              </div>
            ) : promotions.map((promo: any) => (
              <div key={promo.id} className="bg-card p-5 rounded-2xl border border-border shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{promo.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1 flex gap-4 flex-wrap">
                      <span>Giảm: <strong className="text-success">{promo.discount_value}{promo.discount_type === 'percent' ? '%' : 'đ'}</strong></span>
                      <span>Hạng áp dụng: {promo.required_rank?.name || 'Tất cả'}</span>
                      {promo.start_date && <span>Từ: {new Date(promo.start_date).toLocaleDateString('vi-VN')}</span>}
                      {promo.end_date && <span>Đến: {new Date(promo.end_date).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {promo.is_featured ? (
                      <span className="flex items-center gap-1 text-primary"><ToggleRight className="w-5 h-5" /> Hiện Popup</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground"><ToggleLeft className="w-5 h-5" /> Ẩn Popup</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(promo)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa?")) deleteMutation.mutate(promo.id);
                    }}>Xóa</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Sửa Khuyến Mãi" : "Tạo Khuyến Mãi Mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
            <div className="grid gap-2">
              <Label>Tên chương trình (*)</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="VD: Ưu đãi mùa Hè 2026"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ảnh bìa (Tải lên)</Label>
              <div className="flex items-center gap-4">
                {formData.image && typeof formData.image === 'string' && (
                  <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                )}
                {formData.image && formData.image instanceof File && (
                  <img src={URL.createObjectURL(formData.image)} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                )}
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({...formData, image: e.target.files[0]});
                      }
                    }} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Chọn ảnh từ máy tính (Tùy chọn)</p>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Mô tả chi tiết</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Mô tả ngắn gọn về ưu đãi này..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Loại giảm giá</Label>
                <Select value={formData.discount_type} onValueChange={(val) => setFormData({...formData, discount_type: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed_amount">Số tiền mặt (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Mức giảm (*)</Label>
                <Input 
                  type="number"
                  value={formData.discount_value} 
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})} 
                  placeholder="VD: 15"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ngày bắt đầu (Tùy chọn)</Label>
                <Input 
                  type="date"
                  value={formData.start_date} 
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Ngày kết thúc (Tùy chọn)</Label>
                <Input 
                  type="date"
                  value={formData.end_date} 
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Nhãn nổi bật (Badge - VD: HOT, MỚI, SALE)</Label>
              <Input 
                value={formData.badge} 
                onChange={(e) => setFormData({...formData, badge: e.target.value})} 
                placeholder="Để trống nếu không muốn hiển thị nhãn"
              />
            </div>

            <div className="grid gap-2">
              <Label>Áp dụng cho Hạng thẻ</Label>
              <Select value={formData.required_rank_id} onValueChange={(val) => setFormData({...formData, required_rank_id: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tất cả khách hàng</SelectItem>
                  {ranks.map((r: any) => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Áp dụng riêng cho các Tour cụ thể (Tùy chọn)</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1 bg-secondary/20">
                {toursList.map((tour: any) => (
                  <div 
                    key={tour.id} 
                    className="flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer"
                    onClick={() => toggleTourSelection(tour.id)}
                  >
                    {formData.target_tour_ids.includes(tour.id) ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-sm truncate">{tour.name}</span>
                  </div>
                ))}
                {toursList.length === 0 && (
                  <div className="text-sm text-muted-foreground p-2 text-center">Không có tour nào trong hệ thống</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Nếu không chọn Tour nào, khuyến mãi sẽ mặc định áp dụng cho TẤT CẢ các Tour.</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Hiển thị Popup Trang chủ</Label>
                <p className="text-sm text-muted-foreground">Popup sẽ nhảy lên nhắc nhở khi khách vào web</p>
              </div>
              <Switch 
                checked={formData.is_featured}
                onCheckedChange={(val) => setFormData({...formData, is_featured: val})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
