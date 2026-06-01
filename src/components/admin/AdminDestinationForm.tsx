import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AdminDestinationFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  destination: any | null;
  onSuccess: () => void;
}

const AdminDestinationForm = ({ open, onClose, mode, destination, onSuccess }: AdminDestinationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    region: "",
    color: "from-blue-600/20",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && destination) {
      setFormData({
        name: destination.name || "",
        title: destination.title || "",
        description: destination.description || "",
        region: destination.region || "",
        color: destination.color || "from-blue-600/20",
      });
      setImagePreview(destination.image);
    } else {
      setFormData({
        name: "",
        title: "",
        description: "",
        region: "",
        color: "from-blue-600/20",
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [mode, destination, open]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (mode === "create") {
        return await api.post("/admin/destinations", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Laravel doesn't handle multipart/form-data on PUT/PATCH easily with files, 
        // so we use POST with _method=PUT
        data.append("_method", "PUT");
        return await api.post(`/admin/destinations/${destination.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("color", formData.color);
    if (formData.region) data.append("region", formData.region);
    if (imageFile) {
      data.append("image", imageFile);
    }
    mutation.mutate(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            {mode === "create" ? "Thêm điểm đến mới" : "Chỉnh sửa điểm đến"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-smooth">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên điểm đến</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Vịnh Hạ Long"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Miền (*)</Label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
              >
                <option value="">-- Chọn miền --</option>
                <option value="north">Miền Bắc</option>
                <option value="central">Miền Trung</option>
                <option value="south">Miền Nam</option>
              </select>
              <p className="text-[10px] text-muted-foreground">Dùng để lọc điểm đến theo miền trên trang Tours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề phụ (Title)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Kỳ Quan Thiên Nhiên Thế Giới"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả về điểm đến..."
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Màu sắc lớp phủ (Tailwind Class)</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="VD: from-blue-600/20"
              className="rounded-xl"
            />
            <p className="text-[10px] text-muted-foreground">Sử dụng class của Tailwind: from-[color]-[shade]/[opacity]</p>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div className="flex items-center gap-6">
              <div className="relative w-40 h-32 rounded-2xl border-2 border-dashed border-border/50 overflow-hidden group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Label htmlFor="image-upload" className="cursor-pointer p-2 bg-white/20 rounded-full backdrop-blur-md">
                        <Upload className="h-5 w-5 text-white" />
                      </Label>
                    </div>
                  </>
                ) : (
                  <Label htmlFor="image-upload" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-[10px] mt-2 font-medium text-muted-foreground">Tải ảnh lên</span>
                  </Label>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                <p>Khuyên dùng ảnh tỉ lệ 16:9, dung lượng dưới 2MB.</p>
                <p className="mt-1 text-xs text-primary font-medium">Hỗ trợ: JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-secondary/20">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6">
            Hủy bỏ
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending} className="rounded-xl px-8 min-w-[140px]">
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "create" ? (
              "Tạo mới"
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDestinationForm;
