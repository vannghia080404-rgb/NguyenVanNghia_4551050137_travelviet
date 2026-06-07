import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, CreditCard, Banknote, Loader2, MapPin } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setDisplayName }: { position: any, setPosition: any, setDisplayName: any }) {
  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setDisplayName(data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding error", err);
      }
    },
  });
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom() < 12 ? 14 : map.getZoom(), { duration: 1.5 });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function ShopCheckout() {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: user?.phone || "",
    shipping_address: "",
    shipping_lat: null as number | null,
    shipping_lng: null as number | null,
    notes: "",
    delivery_method: "home_delivery",
    payment_method: "cash",
  });
  const [mapPosition, setMapPosition] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (mapPosition) {
      setForm(f => ({ ...f, shipping_lat: mapPosition.lat, shipping_lng: mapPosition.lng }));
    }
  }, [mapPosition]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 5) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn&limit=5`);
          const data = await res.json();
          setSearchResults(data);
          setShowResults(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectAddress = (result: any) => {
    setForm({ ...form, shipping_address: result.display_name });
    setSearchQuery(result.display_name);
    setMapPosition({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setShowResults(false);
  };

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

  const { data: rawCartItems, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/shop/cart").then((res) => res.data.data),
    enabled: !!user,
  });

  const cartItems = Array.isArray(rawCartItems) ? rawCartItems : [];

  const { data: myVouchers } = useQuery({
    queryKey: ["my-vouchers"],
    queryFn: () => api.get("/shop/my-vouchers").then((res) => res.data.data),
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
    mutationFn: (data: any) => api.post("/shop/checkout", { ...data, voucher_id: appliedVoucher?.id }),
    onSuccess: (res) => {
      toast.success("Đặt hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      const selectedMethod = paymentMethods.find((m: any) => m.id.toString() === form.payment_method);
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else if (selectedMethod && selectedMethod.type !== 'cash') {
        navigate(`/payment/transfer/${res.data.order.order_code}?amount=${totalPayment}&method=${selectedMethod.id}`);
      } else {
        navigate("/profile/shop-orders");
      }
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
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-sm font-semibold text-foreground/80 mb-1.5 block">Địa chỉ giao hàng (Cụ thể) *</label>
                      <div className="relative">
                        <Input 
                          className="w-full pr-10 bg-background" 
                          value={searchQuery || form.shipping_address} 
                          onChange={e => {
                            setSearchQuery(e.target.value);
                            setForm({...form, shipping_address: e.target.value});
                          }} 
                          onFocus={() => {if(searchResults.length > 0) setShowResults(true);}}
                          onBlur={() => setTimeout(() => setShowResults(false), 200)}
                          placeholder="Gõ để tìm địa chỉ..." 
                        />
                        {isSearching && <Loader2 className="h-4 w-4 absolute right-3 top-3 animate-spin text-muted-foreground" />}
                      </div>
                      
                      {showResults && searchResults.length > 0 && (
                        <div className="absolute z-[999] w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
                          {searchResults.map((res: any, idx: number) => (
                            <button 
                              key={idx} 
                              className="w-full text-left px-4 py-3 text-sm hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelectAddress(res);
                              }}
                            >
                              {res.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="pt-2">
                      <label className="text-sm font-semibold text-foreground/80 mb-2 block flex items-center gap-2"><MapPin className="h-4 w-4"/> Chọn vị trí trên bản đồ</label>
                      <div className="h-64 rounded-xl overflow-hidden border border-border relative z-0">
                        <MapContainer center={mapPosition || [13.782967, 109.223847]} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <LocationMarker 
                            position={mapPosition} 
                            setPosition={setMapPosition} 
                            setDisplayName={(name: string) => {
                              setSearchQuery(name);
                              setForm({...form, shipping_address: name});
                            }}
                          />
                        </MapContainer>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">Bấm vào bản đồ để ghim vị trí chính xác giúp shipper giao hàng nhanh hơn.</p>
                    </div>
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
              <div className="space-y-3">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method: any) => (
                    <label key={method.id} className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:border-primary/40 transition-all"
                           style={form.payment_method === method.id.toString() ? { borderColor: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.05)' } : {}}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value={method.id.toString()} 
                        checked={form.payment_method === method.id.toString()} 
                        onChange={() => setForm({...form, payment_method: method.id.toString()})} 
                        className="accent-primary" 
                      />
                      <div className={`h-10 w-16 rounded-md flex items-center justify-center shrink-0 border ${!method.qr_code_url ? 'bg-secondary text-secondary-foreground' : ''}`}>
                        {method.qr_code_url ? (
                          <img src={method.qr_code_url} alt={method.name} className="h-full w-full object-cover rounded-md" />
                        ) : (
                          <CreditCard className="w-5 h-5 opacity-50" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{method.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{method.description || (method.type === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : method.type === 'e_wallet' ? 'Ví điện tử' : 'Tiền mặt')}</div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-4 border rounded-xl text-center">Chưa có phương thức thanh toán nào khả dụng.</div>
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 block">Mã giảm giá của bạn</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={appliedVoucher?.id || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) {
                        setAppliedVoucher(null);
                      } else {
                        const selected = myVouchers?.find((v: any) => v.id.toString() === selectedId);
                        if (selected) {
                          setAppliedVoucher(selected);
                          toast.success("Đã chọn mã giảm giá!");
                        }
                      }
                    }}
                  >
                    <option value="">-- Không sử dụng voucher --</option>
                    {myVouchers?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.code} - {v.discount_type === 'percent' ? `Giảm ${v.discount_value}%` : (v.discount_type === 'free_shipping' ? 'Miễn phí vận chuyển' : `Giảm ${new Intl.NumberFormat("vi-VN").format(v.discount_value)}đ`)}
                        {v.min_order_value > 0 ? ` (Đơn từ ${new Intl.NumberFormat("vi-VN").format(v.min_order_value/1000)}k)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {appliedVoucher && (
                  <p className="text-xs text-green-600 font-medium mt-3 flex items-center gap-1 bg-green-50 p-2 rounded border border-green-100">
                    <ShieldCheck className="h-4 w-4" /> Đã chọn mã {appliedVoucher.code} ({appliedVoucher.title || 'Ưu đãi đặc biệt'})
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
