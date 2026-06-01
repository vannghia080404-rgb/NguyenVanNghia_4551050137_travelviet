import { useState, useEffect } from "react";
import { X, Upload, MapPin, Clock, DollarSign, Users, Tag, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, getImageUrl } from "@/lib/utils";
import { adminTourAPIs } from "@/lib/api";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AdminMapPicker } from "./AdminMapPicker";

interface AdminTourFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  tour?: any;
  onSuccess?: () => void;
}

const statuses = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "draft", label: "Nháp" },
];

const regionOptions = [
  { value: "north", label: "Miền Bắc" },
  { value: "central", label: "Miền Trung" },
  { value: "south", label: "Miền Nam" },
];

const AdminTourForm = ({ open, onClose, mode, tour, onSuccess }: AdminTourFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    destination_id: "",
    category_id: "",
    duration: "",
    duration_days: 1,
    price: 0,
    old_price: 0,
    max_slots: 15,
    description: "",
    map_url: "",
    badge: "",
    featured: false,
    highlights: [] as string[],
    essentials: [] as string[],
    included_services: [] as string[],
    excluded_services: [] as string[],
    cancellation_policy: [] as string[],
    itineraries: [] as {day_number: number, title: string, description: string, meals: string}[],
    status: "draft",
    image: null as File | null,
    gallery: [] as File[],
    existing_gallery: [] as string[],
  });

  const [previewImage, setPreviewImage] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { data: tourDetailResponse, isLoading: isLoadingTour } = useQuery({
    queryKey: ["admin-tour", tour?.id],
    queryFn: () => adminTourAPIs.get(tour?.id),
    enabled: !!tour?.id && mode === "edit" && open,
  });

  // Fetch real destinations from API
  const { data: destinationsResponse } = useQuery({
    queryKey: ["destinations-list"],
    queryFn: () => api.get("/admin/destinations").then(r => r.data),
  });
  const destinations = destinationsResponse?.data || [];

  // Fetch real categories from API
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => api.get("/categories").then(r => r.data),
  });
  const categories = categoriesResponse?.data || [];

  const fullTour = tourDetailResponse?.data?.data || tour;

  useEffect(() => {
    if (fullTour && mode === "edit") {
      setFormData({
        name: fullTour.name || "",
        destination_id: fullTour.destination_id || "",
        category_id: fullTour.category_id || "",
        duration: fullTour.duration || "",
        duration_days: fullTour.duration_days || 1,
        price: fullTour.price || 0,
        old_price: fullTour.old_price || 0,
        max_slots: fullTour.max_slots || 15,
        description: fullTour.description || "",
        map_url: fullTour.map_url || "",
        badge: fullTour.badge || "",
        featured: !!fullTour.featured,
        highlights: Array.isArray(fullTour.highlights) ? fullTour.highlights : [],
        essentials: Array.isArray(fullTour.essentials) ? fullTour.essentials : [],
        included_services: Array.isArray(fullTour.included_services) ? fullTour.included_services : [],
        excluded_services: Array.isArray(fullTour.excluded_services) ? fullTour.excluded_services : [],
        cancellation_policy: Array.isArray(fullTour.cancellation_policy) ? fullTour.cancellation_policy : [],
        itineraries: Array.isArray(fullTour.itineraries) ? fullTour.itineraries.map((it: any) => ({
          day_number: it.day_number,
          title: it.title,
          description: it.description,
          meals: it.meals
        })) : [],
        status: fullTour.status || "draft",
        image: null,
        gallery: [],
        existing_gallery: fullTour.images ? fullTour.images.map((img: any) => img.image_path) : [],
      });
      setPreviewImage(fullTour.image || "");
    } else if (!open) {
      resetForm();
    }
  }, [fullTour, mode, open]);

  const resetForm = () => {
    setFormData({
      name: "",
      destination_id: "",
      category_id: "",
      duration: "",
      duration_days: 1,
      price: 0,
      old_price: 0,
      max_slots: 15,
      description: "",
      map_url: "",
      badge: "",
      featured: false,
      highlights: [],
      essentials: [],
      included_services: [],
      excluded_services: [],
      cancellation_policy: [],
      itineraries: [],
      status: "draft",
      image: null,
      gallery: [],
      existing_gallery: [],
    });
    setPreviewImage("");
    setUploadedImages([]);
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === "create") {
        return adminTourAPIs.create(data);
      } else {
        return adminTourAPIs.update(tour.id, data);
      }
    },
    onSuccess: () => {
      toast({ title: "Thành công", description: mode === "create" ? "Tour mới được tạo" : "Tour đã được cập nhật" });
      resetForm();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      let errorMsg = error.response?.data?.message || "Không thể lưu tour";
      if (error.response?.data?.errors) {
        const firstErrorKey = Object.keys(error.response.data.errors)[0];
        errorMsg += `: ${error.response.data.errors[firstErrorKey][0]}`;
      }
      toast({
        title: "Lỗi",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [previewGallery, setPreviewGallery] = useState<{file?: File, url: string, isExisting: boolean}[]>([]);

  useEffect(() => {
    // Sync preview gallery with formData
    const newPreview = [
      ...formData.existing_gallery.map(url => ({ url, isExisting: true })),
      ...formData.gallery.map(file => ({ file, url: URL.createObjectURL(file), isExisting: false }))
    ];
    setPreviewGallery(newPreview);
  }, [formData.existing_gallery, formData.gallery]);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (formData.gallery.length + formData.existing_gallery.length + files.length > 10) {
        toast({ title: "Lỗi", description: "Bạn chỉ có thể tải lên tối đa 10 ảnh.", variant: "destructive" });
        return;
      }
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...files] }));
    }
  };

  const removeGalleryImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setFormData(prev => ({
        ...prev,
        existing_gallery: prev.existing_gallery.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.destination_id || !formData.category_id) {
      toast({ title: "Lỗi", description: "Vui lòng điền tất cả thông tin bắt buộc", variant: "destructive" });
      return;
    }

    // Convert itineraries to string JSON so api.ts can pass it via FormData correctly
    const submitData = { 
      ...formData, 
      featured: formData.featured ? 1 : 0,
      itineraries: JSON.stringify(formData.itineraries) 
    };

    mutation.mutate(submitData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-elevated border border-border/50 w-full max-w-3xl mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {mode === "create" ? "Thêm tour mới" : "Chỉnh sửa tour"}
          </h2>
          <button onClick={onClose} className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {isLoadingTour ? (
          <div className="p-12 flex flex-col justify-center items-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <span className="text-muted-foreground text-sm">Đang tải dữ liệu tour...</span>
          </div>
        ) : (
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>

            <div>
              <label className="text-sm font-medium text-foreground">Tên tour *</label>
              <div className="mt-1.5 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="VD: Hạ Long Bay: Du thuyền 5 sao & Chèo Kayak"
                  className="pl-10 h-11"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Điểm đến *</label>
                <select
                  name="destination_id"
                  className="mt-1.5 w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                  value={formData.destination_id}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn điểm đến</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Thời lượng (ngày) *</label>
                <div className="mt-1.5 relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="duration_days"
                    type="number"
                    placeholder="3"
                    min="1"
                    className="pl-10 h-11"
                    value={formData.duration_days}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-foreground">Mô tả thời lượng</label>
                <Input
                  name="duration"
                  placeholder="VD: 3 ngày 2 đêm"
                  className="mt-1.5 h-11"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Danh mục *</label>
                <select
                  name="category_id"
                  className="mt-1.5 w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Nhãn nổi bật (Badge)</label>
                <Input
                  name="badge"
                  placeholder="VD: HOT, MỚI, SALE..."
                  className="mt-1.5 h-11"
                  value={formData.badge}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-foreground">Giá (VNĐ) *</label>
                <div className="mt-1.5 relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="price"
                    type="number"
                    placeholder="3500000"
                    className="pl-10 h-11"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Giá cũ (tùy chọn)</label>
                <div className="mt-1.5 relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="old_price"
                    type="number"
                    placeholder="4000000"
                    className="pl-10 h-11"
                    value={formData.old_price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Số chỗ tối đa *</label>
                <div className="mt-1.5 relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="max_slots"
                    type="number"
                    placeholder="15"
                    min="1"
                    className="pl-10 h-11"
                    value={formData.max_slots}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Mô tả *</h3>
            <div className="relative mb-4">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                name="description"
                placeholder="Mô tả chi tiết về tour du lịch..."
                className="pl-10 min-h-[120px]"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <AdminMapPicker 
              value={formData.map_url} 
              onChange={(val) => setFormData({ ...formData, map_url: val })} 
              tourName={formData.name}
            />
          </div>

          {/* Array Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Điểm nổi bật</h3>
              <Textarea
                placeholder="Nhập mỗi điểm nổi bật trên 1 dòng..."
                className="pl-3 min-h-[100px]"
                value={formData.highlights.join('\n')}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Thông tin cần biết</h3>
              <Textarea
                placeholder="Nhập mỗi thông tin trên 1 dòng..."
                className="pl-3 min-h-[100px]"
                value={formData.essentials.join('\n')}
                onChange={(e) => setFormData({ ...formData, essentials: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Dịch vụ bao gồm</h3>
              <Textarea
                placeholder="Nhập mỗi dịch vụ trên 1 dòng..."
                className="pl-3 min-h-[100px]"
                value={formData.included_services.join('\n')}
                onChange={(e) => setFormData({ ...formData, included_services: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Không bao gồm</h3>
              <Textarea
                placeholder="Nhập mỗi dịch vụ trên 1 dòng..."
                className="pl-3 min-h-[100px]"
                value={formData.excluded_services.join('\n')}
                onChange={(e) => setFormData({ ...formData, excluded_services: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
            <div className="sm:col-span-2">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Chính sách hủy tour</h3>
              <Textarea
                placeholder="Nhập mỗi chính sách trên 1 dòng..."
                className="pl-3 min-h-[100px]"
                value={formData.cancellation_policy.join('\n')}
                onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
          </div>

          {/* Itineraries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Lịch trình chi tiết</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData,
                  itineraries: [
                    ...formData.itineraries,
                    { day_number: formData.itineraries.length + 1, title: "", description: "", meals: "" }
                  ]
                })}
              >
                + Thêm ngày
              </Button>
            </div>
            <div className="space-y-4">
              {formData.itineraries.map((it, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-secondary/30 relative group">
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      itineraries: formData.itineraries.filter((_, i) => i !== idx)
                    })}
                    className="absolute top-2 right-2 h-7 w-7 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                      <Input
                        placeholder="Tiêu đề (VD: Đón khách & Khởi hành)"
                        value={it.title}
                        onChange={(e) => {
                          const newIt = [...formData.itineraries];
                          newIt[idx].title = e.target.value;
                          setFormData({ ...formData, itineraries: newIt });
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Bữa ăn (VD: Sáng, Trưa)"
                        value={it.meals}
                        onChange={(e) => {
                          const newIt = [...formData.itineraries];
                          newIt[idx].meals = e.target.value;
                          setFormData({ ...formData, itineraries: newIt });
                        }}
                        className="w-[150px]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Textarea
                        placeholder="Mô tả chi tiết lịch trình ngày này..."
                        className="min-h-[80px]"
                        value={it.description}
                        onChange={(e) => {
                          const newIt = [...formData.itineraries];
                          newIt[idx].description = e.target.value;
                          setFormData({ ...formData, itineraries: newIt });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.itineraries.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                  Chưa có lịch trình. Hãy thêm ngày mới!
                </div>
              )}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Hình ảnh chính</h3>
            <div className="flex gap-4">
              {previewImage && (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-border">
                  <img src={getImageUrl(previewImage)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-smooth">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Click để upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Gallery upload */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Thư viện ảnh (Tối đa 10 ảnh)</h3>
              <span className="text-xs text-muted-foreground">{previewGallery.length}/10 ảnh</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {previewGallery.map((item, idx) => {
                const indexInType = item.isExisting 
                  ? formData.existing_gallery.indexOf(item.url) 
                  : formData.gallery.findIndex(f => f === item.file);
                  
                return (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img src={getImageUrl(item.url)} alt="Gallery preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(indexInType, item.isExisting)}
                      className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              
              {previewGallery.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-smooth">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Thêm ảnh</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                </label>
              )}
            </div>
          </div>

          {/* Status & Featured */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Trạng thái</h3>
              <div className="flex gap-3">
                {statuses.map((s) => (
                  <label key={s.value} className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-smooth text-sm font-medium",
                    formData.status === s.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                    <input
                      type="radio"
                      name="status"
                      value={s.value}
                      checked={formData.status === s.value}
                      onChange={handleInputChange}
                      className="accent-primary w-4 h-4"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Đánh giá</h3>
              <label className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-smooth text-sm font-medium h-[44px]",
                formData.featured ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-500" : "border-border text-muted-foreground hover:border-amber-500/40"
              )}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="accent-amber-500 w-4 h-4"
                />
                Đánh dấu là Tour Nổi Bật
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
              Huỷ
            </Button>
            <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "create" ? "Tạo tour" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default AdminTourForm;
