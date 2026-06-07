import { Calendar, Users, ChevronRight, AlertTriangle, User, FileText, Phone, ChevronLeft, CreditCard, Clock, MapPin, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Hotel } from "@/components/HotelSelector";
import { cn } from "@/lib/utils";

interface BookingMainContentProps {
  step: number;
  setStep: (step: number) => void;
  tour: any;
  departureDate: string;
  setDepartureDate: (date: string) => void;
  numPeople: number;
  setNumPeople: (num: number) => void;
  isHotelSoldOut: boolean;
  selectedHotel: Hotel | null;
  handleStep1Next: () => void;
  travelers: any[];
  travelerErrors: any;
  updateTraveler: (index: number, field: any, value: string) => void;
  handleStep2Next: () => void;
  settings: any;
  paymentMethods: any[];
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  agreed: boolean;
  setAgreed: (agreed: boolean) => void;
  handleConfirm: () => void;
  isSubmitting?: boolean;
}

const BookingMainContent = ({
  step,
  setStep,
  tour,
  departureDate,
  setDepartureDate,
  numPeople,
  setNumPeople,
  isHotelSoldOut,
  selectedHotel,
  handleStep1Next,
  travelers,
  travelerErrors,
  updateTraveler,
  handleStep2Next,
  settings,
  paymentMethods,
  paymentMethod,
  setPaymentMethod,
  agreed,
  setAgreed,
  handleConfirm,
  isSubmitting = false,
}: BookingMainContentProps) => {
  return (
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
                  {travelerErrors[index]?.full_name && <p className="text-xs text-destructive mt-1.5">{travelerErrors[index]?.full_name}</p>}
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
                  {travelerErrors[index]?.id_card && <p className="text-xs text-destructive mt-1.5">{travelerErrors[index]?.id_card}</p>}
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
                  {travelerErrors[index]?.date_of_birth && <p className="text-xs text-destructive mt-1.5">{travelerErrors[index]?.date_of_birth}</p>}
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
                  {travelerErrors[index]?.phone && <p className="text-xs text-destructive mt-1.5">{travelerErrors[index]?.phone}</p>}
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
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:border-primary/40 transition-smooth"
                         style={paymentMethod === method.id.toString() ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-foreground)' } : {}}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value={method.id.toString()} 
                      checked={paymentMethod === method.id.toString()} 
                      onChange={() => setPaymentMethod(method.id.toString())} 
                      className="accent-primary" 
                    />
                    <div className={cn(
                      "h-10 w-16 rounded-md flex items-center justify-center shrink-0 border",
                      !method.qr_code_url && "bg-secondary text-secondary-foreground"
                    )}>
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

          {/* Terms */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border/50 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-primary mt-0.5" />
            <span className="text-sm text-muted-foreground">
              Tôi đã đọc và đồng ý với <Link to="#" className="text-accent font-semibold hover:underline">Điều khoản đặt tour</Link> và <Link to="#" className="text-accent font-semibold hover:underline">Chính sách hoàn huỷ</Link> của TravelViet.
            </span>
          </label>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)} disabled={isSubmitting}>
              <ChevronLeft className="h-4 w-4" /> Quay lại
            </Button>
            <Button variant="hero" size="lg" className="flex-1" onClick={handleConfirm} disabled={!agreed || isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</>
              ) : (
                <><Shield className="h-4 w-4" /> Xác nhận & Thanh toán</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingMainContent;
