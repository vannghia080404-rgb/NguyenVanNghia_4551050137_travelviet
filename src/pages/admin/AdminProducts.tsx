import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Package, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

type ProductVariant = {
  id?: number;
  size: string;
  color: string;
  price_modifier: number;
  stock: number;
  image_url?: string;
  image_file?: File;
};

type ProductImage = {
  id: number;
  image_url: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  base_price: string;
  description: string;
  image_url: string;
  is_active: boolean;
  variants: ProductVariant[];
  images?: ProductImage[];
};

const emptyForm = { name: "", category: "Phụ kiện", base_price: "", description: "" };

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const imgRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<ProductImage[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.get("/admin/shop/products").then(r => r.data.data as Product[]),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { form: typeof emptyForm; variants: ProductVariant[]; id?: number }) => {
      const fd = new FormData();
      Object.entries(data.form).forEach(([k, v]) => fd.append(k, String(v)));
      
      const variantsData = data.variants.map(v => {
        const { image_file, ...rest } = v;
        return rest;
      });
      fd.append("variants", JSON.stringify(variantsData));
      
      if (imageFile) fd.append("image", imageFile);
      
      galleryFiles.forEach(f => fd.append("gallery_images[]", f));
      if (deletedImages.length > 0) fd.append("deleted_images", JSON.stringify(deletedImages));

      data.variants.forEach((v, index) => {
        if (v.image_file) {
          fd.append(`variant_image_${index}`, v.image_file);
        }
      });

      if (data.id) {
        fd.append("_method", "PUT");
        return api.post(`/admin/shop/products/${data.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      return api.post("/admin/shop/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success(editingId === "new" ? "Đã thêm sản phẩm!" : "Đã cập nhật sản phẩm!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      resetForm();
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/shop/products/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setVariants([]);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setGalleryFiles([]);
    setExistingGallery([]);
    setDeletedImages([]);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, base_price: p.base_price, description: p.description || "" });
    setVariants(p.variants || []);
    setImagePreview(p.image_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${p.image_url}` : null);
    setExistingGallery(p.images || []);
    setGalleryFiles([]);
    setDeletedImages([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGallery = (id: number) => {
    setDeletedImages(prev => [...prev, id]);
    setExistingGallery(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.base_price) return toast.error("Vui lòng nhập tên và giá gốc");
    saveMutation.mutate({ form, variants, id: editingId !== "new" ? (editingId as number) : undefined });
  };

  const addVariant = () => {
    setVariants([...variants, { size: "Free size", color: "Mặc định", price_modifier: 0, stock: 10 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    // if a new file is added, create a preview url to show temporarily
    if (field === 'image_file' && value instanceof File) {
      newVariants[index].image_url = URL.createObjectURL(value);
    }
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout title="Quản lý Sản phẩm Shop" subtitle="Bán phụ kiện, đồ bơi, thời trang du lịch">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft sticky top-6">
            <h3 className="font-display font-bold text-foreground mb-5 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {editingId === null ? "Thêm sản phẩm" : editingId === "new" ? "Thêm mới" : "Chỉnh sửa"}
            </h3>

            {/* Image upload */}
            <div className="mb-5 flex flex-col items-center">
              <label className="text-sm font-semibold text-foreground/80 mb-2 w-full text-left">Ảnh đại diện sản phẩm *</label>
              <div
                onClick={() => imgRef.current?.click()}
                className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-dashed border-border hover:border-primary bg-background flex items-center justify-center cursor-pointer transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} className="h-full w-full object-cover" alt="preview" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImagePlus className="h-8 w-8 mx-auto mb-1 text-muted-foreground/60" />
                    <span className="text-xs">Tải ảnh chính</span>
                  </div>
                )}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Gallery upload */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-foreground/80 mb-2 flex justify-between items-center">
                Ảnh album (Gallery)
                <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()} className="h-7 text-xs px-2">
                  <Plus className="h-3 w-3 mr-1" /> Thêm ảnh
                </Button>
              </label>
              <input ref={galleryRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryChange} />
              
              <div className="flex flex-wrap gap-2 mt-2">
                {existingGallery.map(img => (
                  <div key={img.id} className="relative h-16 w-16 rounded-xl overflow-hidden border border-border">
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${img.image_url}`} className="h-full w-full object-cover" alt="gallery" />
                    <button type="button" onClick={() => removeExistingGallery(img.id)} className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5 rounded-bl-lg hover:bg-red-500"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {galleryFiles.map((file, index) => (
                  <div key={index} className="relative h-16 w-16 rounded-xl overflow-hidden border border-border">
                    <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" alt="gallery" />
                    <button type="button" onClick={() => removeGalleryFile(index)} className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5 rounded-bl-lg hover:bg-red-500"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {existingGallery.length === 0 && galleryFiles.length === 0 && (
                  <div className="text-xs text-muted-foreground italic w-full p-3 bg-secondary/30 rounded-lg text-center border border-dashed border-border">Chưa có ảnh gallery nào</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground/80">Tên sản phẩm *</label>
                <Input className="mt-1.5 h-11" placeholder="Mũ rơm đi biển..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Danh mục</label>
                  <select className="w-full mt-1.5 h-11 px-3 border border-border rounded-md bg-background text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option>Đồ bơi</option>
                    <option>Mũ / Nón</option>
                    <option>Giày / Dép</option>
                    <option>Phụ kiện</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Giá gốc (VNĐ) *</label>
                  <Input type="number" className="mt-1.5 h-11" placeholder="150000" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground/80">Mô tả</label>
                <textarea className="w-full mt-1.5 p-3 border border-border bg-background rounded-xl text-sm resize-none" rows={3} placeholder="Chất liệu, ưu điểm..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Variants Section */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-foreground/80">Phân loại (Size / Màu)</label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="h-7 text-xs px-2">
                    <Plus className="h-3 w-3 mr-1" /> Thêm size
                  </Button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center bg-secondary/30 p-2 rounded-lg border border-border/50">
                    <label className="h-8 w-8 rounded-md border border-border bg-background overflow-hidden flex items-center justify-center cursor-pointer shrink-0 hover:border-primary">
                      {v.image_url ? (
                        <img src={v.image_url.startsWith('blob:') ? v.image_url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${v.image_url}`} alt="var" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-muted-foreground/50" />
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateVariant(i, 'image_file', file);
                      }} />
                    </label>
                    <Input className="h-8 text-xs" placeholder="Size (S, M...)" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} />
                    <Input className="h-8 text-xs w-20" placeholder="Màu" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                    <Input type="number" className="h-8 text-xs w-20" placeholder="Kho" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} />
                    <button type="button" onClick={() => removeVariant(i)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                {variants.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">Sản phẩm này chưa có phân loại nào.</p>}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              {editingId !== null && (
                <Button variant="outline" onClick={resetForm} className="flex-1">Hủy</Button>
              )}
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 text-white bg-primary hover:bg-primary/95">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId === "new" || editingId !== null ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </div>

            {editingId === null && (
              <Button variant="outline" className="w-full mt-2 border-dashed" onClick={() => setEditingId("new")}>
                <Plus className="h-4 w-4 mr-1" /> Thêm sản phẩm mới
              </Button>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                Danh sách sản phẩm ({data?.length || 0})
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : data?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto opacity-20 mb-3" />
                <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {data?.map(product => (
                  <div key={product.id} className="p-4 flex gap-4 hover:bg-secondary/40 transition-colors">
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-background shrink-0 border border-border/50 flex items-center justify-center">
                      {product.image_url ? (
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${product.image_url}`} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-foreground text-lg">{product.name}</div>
                          <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block mt-1">{product.category}</div>
                        </div>
                        <div className="font-bold text-primary">{new Intl.NumberFormat("vi-VN").format(parseFloat(product.base_price))}đ</div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.variants?.map((v, idx) => (
                          <div key={idx} className="text-xs bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1.5">
                            {v.image_url && (
                              <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${v.image_url}`} alt="variant" className="h-4 w-4 rounded-full object-cover" />
                            )}
                            <span className="font-medium text-foreground">{v.size}</span>
                            <span className="text-muted-foreground">({v.color})</span>
                            <span className="text-success ml-1">Kho: {v.stock}</span>
                          </div>
                        ))}
                        {(!product.variants || product.variants.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">Chưa phân loại</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Xóa sản phẩm ${product.name}?`)) deleteMutation.mutate(product.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
