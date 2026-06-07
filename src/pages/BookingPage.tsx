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
import { travelerSchema } from "@/lib/schemas";
import { z } from "zod";
import BookingSidebar from "@/components/booking/BookingSidebar";
import BookingMainContent from "@/components/booking/BookingMainContent";

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
  const [travelerErrors, setTravelerErrors] = useState<Record<number, Partial<Record<keyof Traveler, string>>>>({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHotelSoldOut = useMemo(() => {
    if (!selectedHotel || !departureDate) return false;
    if (selectedHotel.available_rooms === 0) return true;
    if (selectedHotel.sold_out_dates && selectedHotel.sold_out_dates.includes(departureDate)) return true;
    return false;
  }, [selectedHotel, departureDate]);

  const { data: paymentMethodsResponse } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => api.get('/payment-methods').then(r => r.data.data || []),
  });

  const paymentMethods = paymentMethodsResponse || [];

  const [paymentMethod, setPaymentMethod] = useState("");

  // Set default payment method once loaded
  useMemo(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id.toString());
    }
  }, [paymentMethods, paymentMethod]);

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
    const result = z.array(travelerSchema).safeParse(travelers);
    
    if (!result.success) {
      const newErrors: Record<number, any> = {};
      result.error.issues.forEach(issue => {
        const index = issue.path[0] as number;
        const field = issue.path[1] as string;
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index][field] = issue.message;
      });
      setTravelerErrors(newErrors);
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng kiểm tra và điền đầy đủ thông tin hành khách.",
      });
      return;
    }
    
    setTravelerErrors({});
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
        const selectedMethod = paymentMethods.find((m: any) => m.id.toString() === paymentMethod);
        if (res.data.payment_url) {
           window.location.href = res.data.payment_url;
        } else if (selectedMethod && selectedMethod.type === 'transfer') {
           navigate(`/payment/transfer/${res.data.data.booking_code}?amount=${total}&method=${selectedMethod.id}`);
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
          <BookingMainContent
            step={step}
            setStep={setStep}
            tour={tour}
            departureDate={departureDate}
            setDepartureDate={setDepartureDate}
            numPeople={numPeople}
            setNumPeople={setNumPeople}
            isHotelSoldOut={isHotelSoldOut}
            selectedHotel={selectedHotel}
            handleStep1Next={handleStep1Next}
            travelers={travelers}
            travelerErrors={travelerErrors}
            updateTraveler={updateTraveler}
            handleStep2Next={handleStep2Next}
            settings={settings}
            paymentMethods={paymentMethods}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            agreed={agreed}
            setAgreed={setAgreed}
            handleConfirm={handleConfirm}
          />

          {/* Sidebar */}
          <BookingSidebar
            tour={tour}
            departureDate={departureDate}
            numPeople={numPeople}
            tourPrice={tourPrice}
            hotelPrice={hotelPrice}
            selectedHotel={selectedHotel}
            total={total}
          />
        </div>
      </div>
    </main>
  );
};

export default BookingPage;
