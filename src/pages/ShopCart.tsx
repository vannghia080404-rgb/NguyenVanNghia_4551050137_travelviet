import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export default function Cart() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/shop/cart").then((res) => res.data.data),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/shop/cart/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center pt-20">Vui lòng đăng nhập để xem giỏ hàng.</div>;
  }

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((acc: number, item: any) => {
      const price = parseFloat(item.variant.product.base_price) + parseFloat(item.variant.price_modifier);
      return acc + price * item.quantity;
    }, 0);
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-5xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          Giỏ hàng của bạn
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="bg-card rounded-3xl border border-border p-12 text-center shadow-soft">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/shop">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => {
                const p = item.variant.product;
                const v = item.variant;
                const unitPrice = parseFloat(p.base_price) + parseFloat(v.price_modifier);
                
                return (
                  <div key={item.id} className="bg-card border border-border/50 rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                    <div className="h-24 w-24 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/50">
                      {p.image_url ? (
                        <img src={getImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/shop/${p.slug}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">{p.name}</Link>
                      <div className="text-sm text-muted-foreground mt-1">Phân loại: {v.size} - {v.color}</div>
                      <div className="font-bold text-primary mt-2">{new Intl.NumberFormat("vi-VN").format(unitPrice)}đ <span className="text-muted-foreground font-normal text-sm">x {item.quantity}</span></div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="font-bold text-lg">{new Intl.NumberFormat("vi-VN").format(unitPrice * item.quantity)}đ</div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2" onClick={() => removeMutation.mutate(item.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Xóa
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft sticky top-24">
                <h3 className="font-bold text-lg border-b border-border pb-4 mb-4">Tổng giỏ hàng</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-semibold">{new Intl.NumberFormat("vi-VN").format(calculateTotal())}đ</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="text-success font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-4 mb-6">
                  <span className="font-bold">Tổng cộng:</span>
                  <span className="font-bold text-2xl text-primary">{new Intl.NumberFormat("vi-VN").format(calculateTotal())}đ</span>
                </div>
                <Link to="/checkout-shop">
                  <Button className="w-full h-12 text-base rounded-xl">
                    Tiến hành thanh toán <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
