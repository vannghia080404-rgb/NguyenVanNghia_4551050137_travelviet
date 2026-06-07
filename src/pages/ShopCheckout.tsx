import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, CreditCard, Banknote, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl } from "@/lib/utils";

export default function ShopCheckout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: user?.phone || "",
    shipping_address: "",
    notes: "",
    payment_method: "cash",
  });

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/shop/cart").then((res) => res.data.data),
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/shop/checkout", data),
    onSuccess: (res) => {
      toast.success("Đặt hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // In a real app with VNPay, redirect to res.data.vnp_url here if VNPay was chosen
      navigate("/profile/orders"); // Or redirect to a success page
    },
    onError: () => {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
    }
  });

  if (!user || (!isLoading && (!cartItems || cartItems.length === 0))) {
    return <div className="min-h-screen flex flex-col items-center justify-center pt-20">
      <p className="mb-4">Giỏ hàng trống hoặc chưa đăng nhập.</p>
      <Link to="/shop"><Button>Quay lại Cửa hàng</Button></Link>
    </div>;
  }

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((acc: number, item: any) => {
      const price = parseFloat(item.variant.product.base_price) + parseFloat(item.variant.price_modifier);
      return acc + price * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (!form.shipping_name || !form.shipping_phone || !form.shipping_address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng (Tên, SĐT, Địa chỉ)!");
      return;
    }
    checkoutMutation.mutate(form);
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-5xl">
        <Link to="/cart" className="flex items-center text-muted-foreground hover:text-primary mb-6 inline-flex w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại giỏ hàng
        </Link>
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Thanh toán đơn hàng</h1>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 border-b border-border pb-3">Thông tin nhận hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Họ và tên *</label>
                  <Input className="mt-1.5" value={form.shipping_name} onChange={e => setForm({...form, shipping_name: e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Số điện thoại *</label>
                  <Input className="mt-1.5" value={form.shipping_phone} onChange={e => setForm({...form, shipping_phone: e.target.value})} placeholder="0901234567" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Địa chỉ giao hàng (Cụ thể) *</label>
                  <textarea className="w-full mt-1.5 p-3 border border-border bg-background rounded-xl text-sm resize-none" rows={3} value={form.shipping_address} onChange={e => setForm({...form, shipping_address: e.target.value})} placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Ghi chú thêm (Tùy chọn)</label>
                  <Input className="mt-1.5" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Giao giờ hành chính..." />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 border-b border-border pb-3">Phương thức thanh toán</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${form.payment_method === 'cash' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/50'}`}>
                  <input type="radio" className="hidden" name="payment" value="cash" checked={form.payment_method === 'cash'} onChange={() => setForm({...form, payment_method: 'cash'})} />
                  <Banknote className="h-6 w-6" />
                  <span className="font-semibold text-sm">Thanh toán khi nhận (COD)</span>
                </label>
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${form.payment_method === 'vnpay' ? 'border-[#005BAA] bg-[#005BAA]/5 text-[#005BAA]' : 'border-border bg-card hover:border-[#005BAA]/50'}`}>
                  <input type="radio" className="hidden" name="payment" value="vnpay" checked={form.payment_method === 'vnpay'} onChange={() => setForm({...form, payment_method: 'vnpay'})} />
                  <CreditCard className="h-6 w-6" />
                  <span className="font-semibold text-sm">Ví VNPay</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 border-b border-border pb-3">Tóm tắt đơn hàng</h2>
              
              <div className="max-h-60 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide">
                {cartItems?.map((item: any) => {
                  const p = item.variant.product;
                  const v = item.variant;
                  const unitPrice = parseFloat(p.base_price) + parseFloat(v.price_modifier);
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="h-16 w-16 bg-secondary/50 rounded-xl border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image_url && <img src={getImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{v.size} - {v.color}</div>
                      </div>
                      <div className="text-sm font-semibold shrink-0">
                        {new Intl.NumberFormat("vi-VN").format(unitPrice)}đ x{item.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Tổng tiền hàng:</span>
                  <span className="font-medium">{new Intl.NumberFormat("vi-VN").format(calculateTotal())}đ</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="text-success font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="font-bold text-lg">Tổng thanh toán:</span>
                  <span className="font-bold text-2xl text-primary">{new Intl.NumberFormat("vi-VN").format(calculateTotal())}đ</span>
                </div>
              </div>

              <Button className="w-full h-14 text-base rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleCheckout} disabled={checkoutMutation.isPending}>
                {checkoutMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                XÁC NHẬN ĐẶT HÀNG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
