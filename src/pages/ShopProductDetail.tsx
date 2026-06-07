import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Minus, Plus, ShoppingBag, Package, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl } from "@/lib/utils";

export default function ShopProductDetail() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

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

  const { data: vouchers } = useQuery({
    queryKey: ["shop-vouchers"],
    queryFn: () => api.get('/shop/vouchers').then(res => res.data.data),
  });

  const saveVoucherMutation = useMutation({
    mutationFn: (voucherId: number) => api.post('/shop/save-voucher', { voucher_id: voucherId }),
    onSuccess: () => {
      toast.success("Lưu mã giảm giá thành công! Bạn có thể sử dụng ở giỏ hàng.");
      queryClient.invalidateQueries({ queryKey: ["shop-vouchers"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  });

  const buyNowMutation = useMutation({
    mutationFn: (data: { product_variant_id: number; quantity: number }) => api.post("/shop/cart", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      window.location.href = "/checkout-shop";
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
  const currentDisplayImage = activeImage || selectedVariant?.image_url || product.image_url;

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

  const handleBuyNow = () => {
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
    buyNowMutation.mutate({ product_variant_id: selectedVariant.id, quantity });
  };

  const avgRating = parseFloat(product.avg_rating || 0).toFixed(1);
  const reviewCount = product.review_count || 0;
  const soldCount = product.sold_count || 0;

  const handleSaveVoucher = (voucherId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu mã giảm giá!");
      return;
    }
    saveVoucherMutation.mutate(voucherId);
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
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-3xl overflow-hidden border border-border/50 aspect-[4/5] md:aspect-square relative flex items-center justify-center">
              {currentDisplayImage ? (
                <img 
                  src={getImageUrl(currentDisplayImage)} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-opacity duration-300" 
                />
              ) : (
                <Package className="h-32 w-32 opacity-10" />
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.image_url && (
                <button 
                  onClick={() => setActiveImage(product.image_url)}
                  className={`h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentDisplayImage === product.image_url ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                >
                  <img src={getImageUrl(product.image_url)} alt="main" className="h-full w-full object-cover" />
                </button>
              )}
              {product.images?.map((img: any) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentDisplayImage === img.image_url ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                >
                  <img src={getImageUrl(img.image_url)} alt="gallery" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{product.category}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">{product.name}</h1>
            
            {/* Rating and Sold */}
            <div className="flex items-center gap-4 text-sm mb-4">
              {reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary underline decoration-primary underline-offset-4">{avgRating}</span>
                    <div className="flex items-center text-accent">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${parseFloat(avgRating) >= star ? 'fill-current' : 'text-border fill-border'}`} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div><span className="font-semibold underline decoration-foreground underline-offset-4">{reviewCount}</span> <span className="text-muted-foreground">Đánh giá</span></div>
                </>
              ) : (
                <div className="text-muted-foreground italic">Chưa có đánh giá</div>
              )}
              
              <div className="w-px h-4 bg-border"></div>
              <div><span className="font-semibold">{soldCount}</span> <span className="text-muted-foreground">Đã bán</span></div>
            </div>

            <div className="text-3xl font-bold text-primary mb-6 bg-primary/5 p-4 rounded-2xl border border-primary/10 w-max pr-10">
              {new Intl.NumberFormat("vi-VN").format(currentPrice)}đ
            </div>

            {/* Vouchers (Mã giảm giá) */}
            {vouchers && vouchers.length > 0 && (
              <div className="mb-6 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Mã Giảm Giá Shop</h3>
                <div className="flex flex-wrap gap-3">
                  {vouchers.map((v: any) => (
                    <div key={v.id} className="relative flex items-stretch border border-rose-200 rounded-lg overflow-hidden bg-rose-50 group">
                      <div className="px-3 py-2 border-r border-rose-200 border-dashed flex flex-col justify-center">
                        <span className="text-rose-600 font-bold text-sm">
                          {v.discount_type === 'percent' ? `Giảm ${v.discount_value}%` : (v.discount_type === 'free_shipping' ? 'Freeship' : `Giảm ${v.discount_value/1000}k`)}
                        </span>
                        <span className="text-[10px] text-rose-500">{v.title || `Đơn tối thiểu ${v.min_order_value/1000}k`}</span>
                      </div>
                      <button 
                        onClick={() => handleSaveVoucher(v.id)}
                        disabled={v.is_saved || saveVoucherMutation.isPending}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        {v.is_saved ? "Đã lưu" : "Lưu mã"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariantId(v.id);
                            setActiveImage(null); // let variant override
                          }
                        }}
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
                              src={getImageUrl(v.image_url)} 
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
              <Button size="lg" variant="outline" className="flex-1 h-14 text-base rounded-2xl border-primary text-primary hover:bg-primary/5" onClick={handleAddToCart} disabled={addToCartMutation.isPending || buyNowMutation.isPending || !selectedVariant || selectedVariant.stock === 0}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Thêm vào giỏ
              </Button>
              <Button size="lg" className="flex-1 h-14 text-base rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={handleBuyNow} disabled={addToCartMutation.isPending || buyNowMutation.isPending || !selectedVariant || selectedVariant.stock === 0}>
                Mua ngay
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

        {/* Reviews Section */}
        {product && <ProductReviewSection product={product} user={user} />}
      </div>
    </main>
  );
}

function ProductReviewSection({ product, user }: { product: any, user: any }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  
  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  const { data: reviews, refetch } = useQuery({
    queryKey: ["shop-product-reviews", product.id],
    queryFn: () => api.get(`/shop/products/${product.id}/reviews`).then(res => res.data.data),
  });

  const submitReview = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("product_id", product.id.toString());
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      images.forEach((img) => formData.append("images[]", img));
      return api.post("/shop/products/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Đánh giá của bạn đã được gửi!");
      setComment("");
      setRating(5);
      setImages([]);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  });

  const interactReview = async (id: number, type: 'like' | 'dislike') => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thao tác");
      return;
    }
    try {
      await api.post(`/shop/products/reviews/${id}/${type}`);
      refetch();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-border">
      <h2 className="font-display text-2xl font-bold mb-8">Đánh giá sản phẩm</h2>
      
      {user && (
        <div className="bg-card rounded-2xl p-6 border border-border/50 mb-10 shadow-sm">
          <h3 className="font-semibold mb-4">
            Viết đánh giá của bạn
          </h3>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                <svg className={`w-8 h-8 ${rating >= star ? 'text-accent fill-accent' : 'text-muted-foreground'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này (Tùy chọn)..."
            className="w-full h-24 p-4 rounded-xl border border-input bg-background mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="mb-4">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files) {
                  const filesArray = Array.from(e.target.files);
                  setImages(prev => [...prev, ...filesArray].slice(0, 3)); // Max 3 images
                }
              }} 
              className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-16 w-16 rounded-md overflow-hidden border">
                    <img src={URL.createObjectURL(img)} alt="preview" className="h-full w-full object-cover" />
                    <button 
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={() => submitReview.mutate()} 
            disabled={submitReview.isPending}
            className="rounded-xl px-8"
          >
            Gửi đánh giá
          </Button>
          <p className="text-xs text-muted-foreground mt-3 italic">* Chỉ những khách hàng đã mua và nhận sản phẩm này mới có thể đánh giá.</p>
        </div>
      )}

      <div className="space-y-6">
        {reviews?.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          reviews?.map((review: any) => (
            <div key={review.id} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {review.user?.avatar ? (
                      <img src={getImageUrl(review.user.avatar)} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-primary">{review.user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.user?.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-3 h-3 ${review.rating >= star ? 'text-accent fill-accent' : 'text-muted-foreground'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              <p className="text-sm text-foreground/90 mb-4 whitespace-pre-line">{review.comment || 'Người dùng không để lại bình luận.'}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.images.map((imgUrl: string, idx: number) => (
                    <a key={idx} href={getImageUrl(imgUrl)} target="_blank" rel="noreferrer" className="h-20 w-20 rounded-xl overflow-hidden border border-border/50 block hover:opacity-80 transition-opacity">
                      <img src={getImageUrl(imgUrl)} alt="review image" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4 border-t border-border/50 pt-4 mt-2">
                <button 
                  onClick={() => interactReview(review.id, 'like')} 
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${review.user_reaction === 'like' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={review.user_reaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                  Hữu ích ({review.likes})
                </button>
                <button 
                  onClick={() => interactReview(review.id, 'dislike')} 
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${review.user_reaction === 'dislike' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={review.user_reaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
                  Không hữu ích ({review.dislikes})
                </button>
              </div>

              {review.admin_reply && (
                <div className="mt-4 bg-secondary/50 rounded-xl p-4 border border-border/50 ml-4 relative">
                  <div className="absolute -left-2 top-6 w-4 h-4 bg-secondary/50 border-t border-l border-border/50 rotate-[-45deg]"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-primary">TravelViet Admin</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">QTV</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{review.admin_reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
