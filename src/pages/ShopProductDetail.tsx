import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Minus, Plus, ShoppingBag, Package, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function ShopProductDetail() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["shop-product", slug],
    queryFn: () => api.get(`/shop/products/${slug}`).then((res) => res.data.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: { product_variant_id: number; quantity: number }) => api.post("/shop/cart", data),
    onSuccess: () => {
      toast.success("Đã thêm vào giỏ hàng!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại."),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center pt-20">Không tìm thấy sản phẩm.</div>;
  }

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId) || product.variants?.[0];
  const currentPrice = parseFloat(product.base_price) + (selectedVariant ? parseFloat(selectedVariant.price_modifier) : 0);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại!");
      return;
    }
    if (selectedVariant.stock < quantity) {
      toast.error("Số lượng trong kho không đủ!");
      return;
    }
    addToCartMutation.mutate({ product_variant_id: selectedVariant.id, quantity });
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-primary">Cửa hàng</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="bg-card rounded-3xl overflow-hidden border border-border/50 aspect-[4/5] md:aspect-square relative flex items-center justify-center">
            {(selectedVariant?.image_url || product.image_url) ? (
              <img 
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${selectedVariant?.image_url || product.image_url}`} 
                alt={product.name} 
                className="w-full h-full object-cover transition-opacity duration-300" 
              />
            ) : (
              <Package className="h-32 w-32 opacity-10" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{product.category}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
            
            <div className="text-3xl font-bold text-primary mb-6">
              {new Intl.NumberFormat("vi-VN").format(currentPrice)}đ
            </div>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3">Chọn Size / Màu sắc</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isOutOfStock = v.stock === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => !isOutOfStock && setSelectedVariantId(v.id)}
                        disabled={isOutOfStock}
                        className={`relative px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all overflow-hidden ${
                          isSelected 
                            ? "border-primary bg-primary/5 text-primary" 
                            : isOutOfStock
                              ? "border-border/50 bg-secondary/50 text-muted-foreground/50 cursor-not-allowed"
                              : "border-border bg-card text-foreground hover:border-primary/50"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-primary" />}
                        <div className="flex items-center gap-2">
                          {v.image_url && (
                            <img 
                              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${v.image_url}`} 
                              alt="var" 
                              className="h-6 w-6 rounded-md object-cover border border-border shrink-0"
                            />
                          )}
                          <span>{v.size}</span>
                          <span className="opacity-50">|</span>
                          <span>{v.color}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Tình trạng: <span className={selectedVariant?.stock > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                    {selectedVariant?.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : "Hết hàng"}
                  </span>
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8 flex items-center gap-4">
              <h3 className="text-sm font-semibold w-20">Số lượng:</h3>
              <div className="flex items-center border border-border rounded-lg bg-card h-11 w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Minus className="h-4 w-4" /></button>
                <div className="w-10 text-center font-medium text-foreground">{quantity}</div>
                <button 
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))} 
                  className="flex-1 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-10">
              <Button size="lg" className="flex-1 h-14 text-base rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={handleAddToCart} disabled={addToCartMutation.isPending || !selectedVariant || selectedVariant.stock === 0}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-8 border-t border-border">
                <h3 className="font-display text-lg font-bold mb-4">Chi tiết sản phẩm</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
