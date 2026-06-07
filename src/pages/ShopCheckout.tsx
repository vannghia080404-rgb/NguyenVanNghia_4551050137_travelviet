import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, CreditCard, Banknote, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function ShopCheckout() {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: user?.phone || "",
    shipping_address: "",
    notes: "",
    delivery_method: "home_delivery",
    payment_method: "cash",
  });

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const { data: paymentMethodsResponse } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => api.get('/payment-methods').then(r => r.data.data || []),
  });

  const paymentMethods = paymentMethodsResponse || [];

  // Set default payment method once loaded
  useMemo(() => {
    if (paymentMethods.length > 0 && form.payment_method === "cash") {
      setForm((prev) => ({ ...prev, payment_method: paymentMethods[0].id.toString() }));
    }
  }, [paymentMethods, form.payment_method]);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/shop/cart").then((res) => res.data.data),
    enabled: !!user,
  });

  const applyVoucherMutation = useMutation({
    mutationFn: (code: string) => api.post("/shop/check-voucher", { code }),
    onSuccess: (res) => {
      setAppliedVoucher(res.data.data);
      toast.success("Áp dụng mã giảm giá thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Mã giảm giá không hợp lệ.");
      setAppliedVoucher(null);
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: any) => api.post("/shop/checkout", { ...data, voucher_code: appliedVoucher?.code }),
    onSuccess: (res) => {
      toast.success("Đặt hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate("/profile/shop-orders");
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

  const itemTotal = calculateTotal();
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount_type === 'percent') {
      discountAmount = itemTotal * (appliedVoucher.discount_value / 100);
      if (appliedVoucher.max_discount) discountAmount = Math.min(discountAmount, parseFloat(appliedVoucher.max_discount));
    } else {
      discountAmount = Math.min(parseFloat(appliedVoucher.discount_value), itemTotal);
    }
  }

  const defaultShippingFee = settings.shop_shipping_fee ? parseInt(settings.shop_shipping_fee) : 30000;
  const shippingFee = form.delivery_method === 'home_delivery' ? defaultShippingFee : 0;
  const totalPayment = itemTotal - discountAmount + shippingFee;

  const handleCheckout = () => {
    if (!form.shipping_name || !form.shipping_phone) {
      toast.error("Vui lòng điền họ tên và số điện thoại!");
      return;
    }
    if (form.delivery_method === 'home_delivery' && !form.shipping_address) {
      toast.error("Vui lòng điền địa chỉ giao hàng!");
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
                <div className="flex bg-secondary/50 rounded-xl p-1 mb-4">
                  <button className={`flex-1 text-sm font-semibold py-2.5 rounded-lg transition-colors ${form.delivery_method === 'home_delivery' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setForm({...form, delivery_method: 'home_delivery'})}>
                    Giao tận nơi
                  </button>
                  <button className={`flex-1 text-sm font-semibold py-2.5 rounded-lg transition-colors ${form.delivery_method === 'office_pickup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setForm({...form, delivery_method: 'office_pickup'})}>
                    Nhận tại cửa hàng
                  </button>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Họ và tên *</label>
                  <Input className="mt-1.5" value={form.shipping_name} onChange={e => setForm({...form, shipping_name: e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Số điện thoại *</label>
                  <Input className="mt-1.5" value={form.shipping_phone} onChange={e => setForm({...form, shipping_phone: e.target.value})} placeholder="0901234567" />
                </div>
                {form.delivery_method === 'home_delivery' && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/80">Địa chỉ giao hàng (Cụ thể) *</label>
                    <textarea className="w-full mt-1.5 p-3 border border-border bg-background rounded-xl text-sm resize-none" rows={3} value={form.shipping_address} onChange={e => setForm({...form, shipping_address: e.target.value})} placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-foreground/80">Ghi chú thêm (Tùy chọn)</label>
                  <Input className="mt-1.5" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Giao giờ hành chính..." />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 border-b border-border pb-3">Phương thức thanh toán</h2>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method: any) => (
                    <label key={method.id} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center justify-center gap-2 transition-all ${form.payment_method === method.id.toString() ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/50'}`}>
                      <input type="radio" className="hidden" name="payment" value={method.id.toString()} checked={form.payment_method === method.id.toString()} onChange={() => setForm({...form, payment_method: method.id.toString()})} />
                      {method.qr_code_url ? (
                        <img src={method.qr_code_url} alt={method.name} className="h-8 w-12 object-cover rounded shadow-sm" />
                      ) : (
                        method.type === 'cash' ? <Banknote className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />
                      )}
                      <span className="font-semibold text-sm line-clamp-2">{method.name}</span>
                    </label>
                  ))
                ) : (
                  <div className="col-span-2 text-sm text-muted-foreground text-center p-4">Chưa có phương thức thanh toán.</div>
                )}
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

              <div className="mb-6 p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Mã giảm giá (nếu có)" 
                    value={voucherCode} 
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="bg-background uppercase"
                    disabled={applyVoucherMutation.isPending || appliedVoucher}
                  />
                  {appliedVoucher ? (
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }}>Hủy</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => applyVoucherMutation.mutate(voucherCode)} disabled={!voucherCode || applyVoucherMutation.isPending}>
                      {applyVoucherMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
                    </Button>
                  )}
                </div>
                {appliedVoucher && (
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Đã áp dụng mã {appliedVoucher.code} thành công!
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Tổng tiền hàng:</span>
                  <span className="font-medium">{new Intl.NumberFormat("vi-VN").format(itemTotal)}đ</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className={shippingFee === 0 ? "text-success font-medium" : "font-medium"}>
                    {shippingFee === 0 ? "Miễn phí (Nhận tại VP)" : `${new Intl.NumberFormat("vi-VN").format(shippingFee)}đ`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-600 font-medium">
                    <span>Giảm giá ({appliedVoucher?.code}):</span>
                    <span>-{new Intl.NumberFormat("vi-VN").format(discountAmount)}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="font-bold text-lg">Tổng thanh toán:</span>
                  <span className="font-bold text-2xl text-primary">{new Intl.NumberFormat("vi-VN").format(totalPayment)}đ</span>
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
