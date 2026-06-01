import { useParams, Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Calendar, Users, User, Phone, CreditCard, FileText, ChevronLeft, Check, MapPin, Clock, Shield, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatVND } from "@/components/TourCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const steps = [
  { id: 1, label: "Chọn ngày & số người", icon: Calendar },
  { id: 2, label: "Thông tin hành khách", icon: Users },
  { id: 3, label: "Xác nhận & thanh toán", icon: CreditCard },
];

type Traveler = {
  full_name: string;
  id_card: string;
  date_of_birth: string;
  phone: string;
};

const BookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { settings } = useSettingsStore();

  const { data: response, isLoading } = useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      const res = await api.get(`/tours/${slug}`);
      return res.data;
    }
  });

  const tour = response?.data;

  const [searchParams] = useSearchParams();
  const initialAdults = parseInt(searchParams.get("adults") || "2", 10);
  const hotelIdParam = searchParams.get("hotel_id");

  const { data: hotelsResponse } = useQuery({
    queryKey: ["tour-hotels", tour?.id],
    queryFn: () => api.get(`/tours/${tour?.id}/hotels`).then(r => r.data.data || []),
    enabled: !!tour && !!hotelIdParam,
  });

  const selectedHotel = useMemo(() => {
    if (!hotelsResponse || !hotelIdParam) return null;
    return hotelsResponse.find((h: any) => h.id.toString() === hotelIdParam) || null;
  }, [hotelsResponse, hotelIdParam]);

  const departureDateParam = searchParams.get("departure_date") || "";

  const [step, setStep] = useState(1);
  const [departureDate, setDepartureDate] = useState(departureDateParam);
  const [numPeople, setNumPeople] = useState(initialAdults);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHotelSoldOut = useMemo(() => {
    if (!selectedHotel || !departureDate) return false;
    if (selectedHotel.available_rooms === 0) return true;
    if (selectedHotel.sold_out_dates && selectedHotel.sold_out_dates.includes(departureDate)) return true;
    return false;
  }, [selectedHotel, departureDate]);

  // Determine first available payment method
  const defaultPaymentMethod = settings.payment_vnpay_enabled === "true" ? "vnpay" : 
                               settings.payment_viettel_enabled === "true" ? "viettel_money" : 
                               settings.payment_momo_enabled === "true" ? "momo" : "cash";

  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);

  if (isLoading) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!tour) return <Navigate to="/tours" replace />;

  const tourPrice = tour.price * numPeople;
  const hotelPrice = selectedHotel ? selectedHotel.price_per_night * (tour.duration_days || 1) : 0;
  const total = tourPrice + hotelPrice;

  const handleStep1Next = () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để đặt tour.",
      });
      navigate("/login");
      return;
    }

    if (!departureDate || numPeople < 1) return;
    // Init travelers array based on numPeople
    if (travelers.length !== numPeople) {
      setTravelers(
        Array.from({ length: numPeople }, (_, i) => travelers[i] || { full_name: "", id_card: "", date_of_birth: "", phone: "" })
      );
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    const allFilled = travelers.every((t) => t.full_name && t.id_card && t.date_of_birth && t.phone);
    if (!allFilled) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin hành khách.",
      });
      return;
    }
    setStep(3);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        tour_id: tour.id,
        departure_date: departureDate,
        num_people: numPeople,
        payment_method: paymentMethod,
        travelers: travelers
      };
      if (selectedHotel) {
        payload.hotel_id = selectedHotel.id;
      }
      
      const res = await api.post("/bookings", payload);
      if (res.data.success) {
        toast({
          title: "Thành công",
          description: "Đặt tour thành công!",
        });
        if (paymentMethod === 'viettel_money') {
           navigate(`/payment/transfer/${res.data.data.booking_code}?amount=${total}`);
        } else if (res.data.payment_url) {
           window.location.href = res.data.payment_url;
        } else {
           navigate(`/payment-result?status=success&tour=${encodeURIComponent(tour.name)}&amount=${total}`);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi đặt tour",
        description: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    setTravelers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm flex-wrap">
          <Link to="/" className="text-muted-foreground hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link to="/tours" className="text-muted-foreground hover:text-primary">Tour Việt Nam</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link to={`/tours/${tour.slug}`} className="text-muted-foreground hover:text-primary">{tour.name}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary font-medium">Đặt tour</span>
        </nav>

        <h1 className="mt-6 font-display text-3xl md:text-4xl font-bold text-foreground">Đặt tour du lịch</h1>
        <p className="mt-2 text-muted-foreground">Hoàn tất 3 bước đơn giản để đặt tour {tour.name}</p>

        {/* Progress */}
        <div className="mt-8 flex items-center justify-between max-w-2xl">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-smooth",
                step > s.id ? "bg-success text-white" :
                step === s.id ? "bg-primary text-primary-foreground shadow-soft" :
                "bg-secondary text-muted-foreground"
              )}>
                {step > s.id ? <Check className="h-5 w-5" /> : s.id}
              </div>
              <div className="hidden sm:block min-w-0">
                <div className={cn("text-sm font-medium", step >= s.id ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 rounded-full mx-2", step > s.id ? "bg-success" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div>
            {/* Step 1 */}
            {step === 1 && (
              <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8 animate-fade-in">
                <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Bước 1: Chọn ngày và số lượng
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground">Ngày khởi hành</label>
                    <div className="mt-1.5 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full h-12 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                        min={new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Ngày khởi hành phải cách hôm nay ít nhất 3 ngày</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Số lượng hành khách</label>
                    <div className="mt-1.5 flex items-center gap-4">
                      <button
                        onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                        className="h-12 w-12 rounded-lg border border-border flex items-center justify-center hover:bg-secondary text-lg font-semibold transition-smooth"
                      >−</button>
                      <div className="flex-1 h-12 rounded-lg border border-input bg-background flex items-center justify-center">
                        <Users className="h-4 w-4 text-accent mr-2" />
                        <span className="font-semibold text-lg">{numPeople}</span>
                        <span className="text-sm text-muted-foreground ml-2">người</span>
                      </div>
                      <button
                        onClick={() => setNumPeople(Math.min(15, numPeople + 1))}
                        className="h-12 w-12 rounded-lg border border-border flex items-center justify-center hover:bg-secondary text-lg font-semibold transition-smooth"
                      >+</button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Tối đa 15 người / đơn đặt</p>
                  </div>
                  {isHotelSoldOut && (
                    <div className="p-4 bg-destructive/15 border border-destructive/30 rounded-xl text-sm text-destructive flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Khách sạn <strong>{selectedHotel?.name}</strong> đã hết phòng vào ngày {new Date(departureDate + 'T00:00:00').toLocaleDateString('vi-VN')}. Vui lòng thay đổi ngày khởi hành hoặc chọn tour khác.
                      </span>
                    </div>
                  )}
                </div>

                <Button variant="hero" size="lg" className="w-full mt-8" onClick={handleStep1Next} disabled={!departureDate || numPeople < 1 || isHotelSoldOut}>
                  Tiếp tục <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Bước 2: Thông tin hành khách ({numPeople} người)
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">Vui lòng điền đầy đủ thông tin cho từng hành khách</p>
                </div>

                {travelers.map((traveler, index) => (
                  <div key={index} className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8">
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-5">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      Hành khách {index + 1} {index === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium ml-1">Đại diện</span>}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Họ và tên</label>
                        <div className="mt-1.5 relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Hãy điền họ và tên hành khách..."
                            className="pl-10 h-11"
                            value={traveler.full_name}
                            onChange={(e) => updateTraveler(index, "full_name", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Số CCCD / CMND</label>
                        <div className="mt-1.5 relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="0123456789xx"
                            className="pl-10 h-11"
                            value={traveler.id_card}
                            onChange={(e) => updateTraveler(index, "id_card", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Ngày sinh</label>
                        <div className="mt-1.5 relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="date"
                            className="w-full h-11 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                            value={traveler.date_of_birth}
                            onChange={(e) => updateTraveler(index, "date_of_birth", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Số điện thoại</label>
                        <div className="mt-1.5 relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="0901 234 567"
                            className="pl-10 h-11"
                            value={traveler.phone}
                            onChange={(e) => updateTraveler(index, "phone", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4" /> Quay lại
                  </Button>
                  <Button variant="hero" size="lg" className="flex-1" onClick={handleStep2Next}>
                    Tiếp tục <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Bước 3: Xác nhận đặt tour
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">Vui lòng kiểm tra lại thông tin trước khi thanh toán</p>
                </div>

                {/* Tour summary */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8">
                  <h3 className="font-display font-semibold text-foreground mb-4">Thông tin tour</h3>
                  <div className="flex gap-4">
                    <img src={tour.image} alt={tour.name} className="h-20 w-28 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">{tour.name}</h4>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {tour.destination?.name || tour.destination}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {tour.duration}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {departureDate}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {numPeople} người</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traveler summary */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8">
                  <h3 className="font-display font-semibold text-foreground mb-4">Danh sách hành khách</h3>
                  <div className="space-y-3">
                    {travelers.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">{t.full_name}</div>
                          <div className="text-xs text-muted-foreground">CCCD: {t.id_card} · SĐT: {t.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-8">
                  <h3 className="font-display font-semibold text-foreground mb-4">Phương thức thanh toán</h3>
                  <div className="space-y-3">
                    {settings.payment_vnpay_enabled === "true" && (
                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:border-primary/40 transition-smooth"
                             style={paymentMethod === 'vnpay' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-foreground)' } : {}}>
                        <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="accent-primary" />
                        <div className="h-8 w-12 rounded-md bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">VNPay</div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">VNPay</div>
                          <div className="text-xs text-muted-foreground">Thanh toán qua cổng VNPay (ATM, Visa, QR)</div>
                        </div>
                      </label>
                    )}
                    {settings.payment_viettel_enabled === "true" && (
                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:border-primary/40 transition-smooth"
                             style={paymentMethod === 'viettel_money' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-foreground)' } : {}}>
                        <input type="radio" name="payment" value="viettel_money" checked={paymentMethod === 'viettel_money'} onChange={() => setPaymentMethod('viettel_money')} className="accent-primary" />
                        <div className="h-8 w-14 rounded-md bg-red-600 text-white text-[10px] font-bold flex flex-col items-center justify-center leading-[10px] shrink-0"><span>Viettel</span><span>Money</span></div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">Chuyển khoản / Quét mã QR</div>
                          <div className="text-xs text-muted-foreground">Chuyển tiền qua Viettel Money hoặc App Ngân hàng</div>
                        </div>
                      </label>
                    )}
                    {settings.payment_momo_enabled === "true" && (
                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:border-primary/40 transition-smooth"
                             style={paymentMethod === 'momo' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-foreground)' } : {}}>
                        <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="accent-primary" />
                        <div className="h-8 w-12 rounded-md bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">MoMo</div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">Ví điện tử MoMo</div>
                          <div className="text-xs text-muted-foreground">Thanh toán nhanh chóng qua ứng dụng MoMo</div>
                        </div>
                      </label>
                    )}
                    {settings.payment_cash_enabled === "true" && (
                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:border-primary/40 transition-smooth"
                             style={paymentMethod === 'cash' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-foreground)' } : {}}>
                        <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="accent-primary" />
                        <div className="h-8 w-12 rounded-md bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">Cash</div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">Thanh toán tiền mặt</div>
                          <div className="text-xs text-muted-foreground">Thanh toán trực tiếp tại văn phòng công ty</div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border/50 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Tôi đã đọc và đồng ý với <Link to="#" className="text-accent font-semibold hover:underline">Điều khoản đặt tour</Link> và <Link to="#" className="text-accent font-semibold hover:underline">Chính sách hoàn huỷ</Link> của TravelViet.
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>
                    <ChevronLeft className="h-4 w-4" /> Quay lại
                  </Button>
                  <Button variant="hero" size="lg" className="flex-1" onClick={handleConfirm} disabled={!agreed}>
                    <Shield className="h-4 w-4" /> Xác nhận & Thanh toán
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border/50 rounded-2xl shadow-card p-6">
              <div className="flex gap-3 pb-5 border-b border-border">
                <img src={tour.image} alt={tour.name} className="h-16 w-20 rounded-xl object-cover shrink-0" />
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">{tour.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {tour.destination?.name || tour.destination}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày khởi hành</span>
                  <span className="font-medium text-foreground">{departureDate || "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium text-foreground">{tour.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số hành khách</span>
                  <span className="font-medium text-foreground">{numPeople} người</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{formatVND(tour.price)} × {numPeople} khách</span>
                  <span className="font-medium text-foreground">{formatVND(tourPrice)}</span>
                </div>
                {selectedHotel && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Khách sạn ({tour.duration_days || 1} đêm)</span>
                    <span className="font-medium text-amber-600">
                      +{formatVND(hotelPrice)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí dịch vụ</span>
                  <span className="font-medium text-foreground">0đ</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-display font-bold text-lg">Tổng cộng</span>
                  <span className="font-display font-bold text-lg text-primary">{formatVND(total)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-success">
                <Shield className="h-4 w-4" />
                <span>Miễn phí huỷ trước 72 giờ khởi hành</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default BookingPage;
