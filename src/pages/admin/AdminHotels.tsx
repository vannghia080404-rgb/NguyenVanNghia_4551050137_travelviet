import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Loader2, Building2, Search, Calendar, X,
  Phone, Mail, UserCheck, MapPin, ImagePlus, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  contact_person: string | null;
  region: string | null;
  image: string | null;
  status: "active" | "inactive";
  star: number;
  price_per_night: number;
  available_rooms: number;
  tour_id: number;
  is_default: boolean;
  sold_out_dates?: string[];
  tour?: { id: number; name: string };
}

const AdminHotels = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    contact_person: "",
    region: "",
    star: 3,
    price_per_night: "",
    available_rooms: "",
    tour_id: "",
    status: "active" as "active" | "inactive",
    is_default: false,
    sold_out_dates: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newSoldOutDate, setNewSoldOutDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: () => api.get("/admin/hotels").then((res) => res.data.data),
  });

  const { data: toursData } = useQuery({
    queryKey: ["admin-tours-list"],
    queryFn: () =>
      api.get("/admin/tours").then((res) => {
        const result = res.data.data;
        return Array.isArray(result) ? result : result?.data || [];
      }),
  });

  const hotels: Hotel[] = data || [];
  const tours: any[] = Array.isArray(toursData) ? toursData : [];

  const filteredHotels = hotels.filter((h) => {
    const search = searchTerm.toLowerCase();
    return (
      (h.name?.toLowerCase().includes(search) || false) ||
      (h.tour?.name?.toLowerCase().includes(search) || false) ||
      (h.region?.toLowerCase().includes(search) || false)
    );
  });

  const mutation = useMutation({
    mutationFn: (payload: FormData) => {
      if (editingHotel) {
        payload.append("_method", "PUT");
        return api.post(`/admin/hotels/${editingHotel.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.post("/admin/hotels", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      queryClient.invalidateQueries({ queryKey: ["tour-hotels"] });
      toast.success(editingHotel ? "Cập nhật thành công!" : "Thêm mới thành công!");
      handleCloseModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/hotels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      queryClient.invalidateQueries({ queryKey: ["tour-hotels"] });
      toast.success("Đã xóa khách sạn!");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("status", status);
      return api.post(`/admin/hotels/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      queryClient.invalidateQueries({ queryKey: ["tour-hotels"] });
      toast.success("Đã cập nhật trạng thái!");
    },
  });

  const handleOpenModal = (hotel?: Hotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone || "",
        email: hotel.email || "",
        contact_person: hotel.contact_person || "",
        region: hotel.region || "",
        star: hotel.star,
        price_per_night: hotel.price_per_night.toString(),
        available_rooms: hotel.available_rooms.toString(),
        tour_id: hotel.tour_id.toString(),
        status: hotel.status || "active",
        is_default: hotel.is_default || false,
        sold_out_dates: hotel.sold_out_dates || [],
      });
      setImagePreview(hotel.image || null);
    } else {
      setEditingHotel(null);
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        contact_person: "",
        region: "",
        star: 3,
        price_per_night: "",
        available_rooms: "",
        tour_id: "",
        status: "active",
        is_default: false,
        sold_out_dates: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
    setImageFile(null);
    setImagePreview(null);
    setNewSoldOutDate("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("address", formData.address);
    fd.append("phone", formData.phone);
    fd.append("email", formData.email);
    fd.append("contact_person", formData.contact_person);
    fd.append("region", formData.region);
    fd.append("status", formData.status);
    fd.append("star", String(formData.star));
    fd.append("price_per_night", formData.price_per_night);
    fd.append("available_rooms", formData.available_rooms);
    fd.append("tour_id", formData.tour_id);
    fd.append("is_default", formData.is_default ? "1" : "0");
    
    // Send dates exactly as they are in the formData state
    let finalDates = [...formData.sold_out_dates];
    
    if (finalDates.length > 0) {
      finalDates.forEach((d) => fd.append("sold_out_dates[]", d));
    } else {
      fd.append("sold_out_dates", "");
    }
    if (imageFile) {
      fd.append("image", imageFile);
    }
    mutation.mutate(fd);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách sạn này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

  const getImageUrl = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${apiBase}${img}`;
  };

  return (
    <AdminLayout title="Quản lý khách sạn đối tác">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, tour, hoặc khu vực..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Thêm khách sạn
        </Button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6 font-semibold">Khách sạn</th>
                <th className="py-4 px-6 font-semibold">Khu vực</th>
                <th className="py-4 px-6 font-semibold">Giá / đêm</th>
                <th className="py-4 px-6 font-semibold">Phòng</th>
                <th className="py-4 px-6 font-semibold">Tour liên kết</th>
                <th className="py-4 px-6 font-semibold">Liên hệ</th>
                <th className="py-4 px-6 font-semibold">Trạng thái</th>
                <th className="py-4 px-6 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Không tìm thấy khách sạn nào.
                  </td>
                </tr>
              ) : (
                filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                    {/* Tên + ảnh */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                          {hotel.image ? (
                            <img src={getImageUrl(hotel.image)!} alt={hotel.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center">
                              <Building2 className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            {hotel.name}
                            <span className="text-xs text-accent">({hotel.star}⭐)</span>
                            {hotel.is_default && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">Mặc định</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{hotel.address}</div>
                        </div>
                      </div>
                    </td>
                    {/* Khu vực */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{hotel.region || "—"}</span>
                      </div>
                    </td>
                    {/* Giá */}
                    <td className="py-4 px-6 font-medium text-foreground whitespace-nowrap">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(hotel.price_per_night)}
                    </td>
                    {/* Phòng */}
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          hotel.available_rooms > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {hotel.available_rooms > 0 ? `${hotel.available_rooms} phòng` : "Hết phòng"}
                      </span>
                    </td>
                    {/* Tour */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground font-medium line-clamp-1">
                        {hotel.tour?.name || "Không rõ"}
                      </span>
                    </td>
                    {/* Liên hệ */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        {hotel.contact_person && (
                          <div className="flex items-center gap-1"><UserCheck className="h-3 w-3 shrink-0" />{hotel.contact_person}</div>
                        )}
                        {hotel.phone && (
                          <div className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{hotel.phone}</div>
                        )}
                        {!hotel.contact_person && !hotel.phone && <span>—</span>}
                      </div>
                    </td>
                    {/* Trạng thái */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: hotel.id,
                            status: hotel.status === "active" ? "inactive" : "active",
                          })
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          hotel.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {hotel.status === "active" ? (
                          <><ToggleRight className="h-3.5 w-3.5" /> Hoạt động</>
                        ) : (
                          <><ToggleLeft className="h-3.5 w-3.5" /> Tạm ngưng</>
                        )}
                      </button>
                    </td>
                    {/* Thao tác */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(hotel)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(hotel.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHotel ? "Chỉnh sửa khách sạn" : "Thêm khách sạn đối tác"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            {/* Upload ảnh */}
            <div>
              <label className="text-sm font-medium mb-2 block">Hình ảnh khách sạn</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview.startsWith("blob:") ? imagePreview : getImageUrl(imagePreview)!} alt="Preview" className="h-40 w-full object-cover rounded-lg" />
                ) : (
                  <div className="py-8 text-muted-foreground">
                    <ImagePlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nhấn để chọn ảnh hoặc kéo thả vào đây</p>
                    <p className="text-xs mt-1">JPG, PNG, WebP (tối đa 2MB)</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Tour liên kết */}
            <div>
              <label className="text-sm font-medium">Tour liên kết <span className="text-destructive">*</span></label>
              <select
                className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.tour_id}
                onChange={(e) => setFormData({ ...formData, tour_id: e.target.value })}
                required
              >
                <option value="">-- Chọn Tour --</option>
                {tours.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Tên khách sạn <span className="text-destructive">*</span></label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1.5" placeholder="VD: Vinpearl Resort Hạ Long" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Địa chỉ <span className="text-destructive">*</span></label>
                <Input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1.5" placeholder="VD: Số 10, Đường Hạ Long, TP. Hạ Long" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Khu vực lân cận</label>
                <Input value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="mt-1.5" placeholder="VD: Bãi Cháy, Quảng Ninh" />
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thông tin liên hệ đối tác</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Người đại diện</label>
                  <Input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="mt-1.5" placeholder="VD: Nguyễn Văn A" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Số điện thoại</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1.5" placeholder="VD: 0912 345 678" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1.5" placeholder="VD: contact@hotel.vn" />
                </div>
              </div>
            </div>

            {/* Thông tin phòng & giá */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Phòng & Giá</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Hạng sao</label>
                  <Input required type="number" min="1" max="5" value={formData.star} onChange={(e) => setFormData({ ...formData, star: Number(e.target.value) })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phòng khả dụng</label>
                  <Input required type="number" min="0" value={formData.available_rooms} onChange={(e) => setFormData({ ...formData, available_rooms: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select
                    className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ngưng</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="text-sm font-medium">Giá phụ thu mỗi đêm (VND) <span className="text-destructive">*</span></label>
                  <Input required type="number" min="0" step="1000" value={formData.price_per_night} onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })} className="mt-1.5" disabled={formData.is_default} />
                  {formData.is_default && <p className="text-[10px] text-muted-foreground mt-1">Khách sạn mặc định được miễn phí phụ thu</p>}
                </div>
                <div className="col-span-3 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
                    Đặt làm khách sạn mặc định của tour này
                  </label>
                </div>
              </div>
            </div>

            {/* Ngày hết phòng */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ngày hết phòng (Cao điểm)</p>
              <p className="text-xs text-muted-foreground mb-3">Chọn các ngày cụ thể mà khách sạn này hết phòng. Khách hàng sẽ không thể đặt tour với khách sạn này vào những ngày đã chọn.</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={newSoldOutDate}
                  onChange={(e) => setNewSoldOutDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newSoldOutDate && !formData.sold_out_dates.includes(newSoldOutDate)) {
                      setFormData({ ...formData, sold_out_dates: [...formData.sold_out_dates, newSoldOutDate].sort() });
                      setNewSoldOutDate("");
                    }
                  }}
                  className="h-10 px-4"
                >
                  <Plus className="h-4 w-4 mr-1" /> Thêm
                </Button>
              </div>
              {formData.sold_out_dates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sold_out_dates.map((date) => (
                    <span key={date} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-medium">
                      <Calendar className="h-3 w-3" />
                      {new Date(date + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sold_out_dates: formData.sold_out_dates.filter((d) => d !== date) })}
                        className="ml-0.5 hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
              <Button type="button" variant="outline" onClick={handleCloseModal}>Hủy</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingHotel ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminHotels;
