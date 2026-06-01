import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building2, Star, BedDouble, MapPin, AlertTriangle, Info, UserCheck, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  contact_person: string | null;
  region: string | null;
  image: string | null;
  status: "active" | "inactive";
  star: number;
  price_per_night: number;
  available_rooms: number;
  distance_km: number;
  tour_id: number;
  is_default: boolean;
  sold_out_dates?: string[];
}

interface Props {
  tourId: number;
  selectedHotel: Hotel | null;
  onSelect: (hotel: Hotel | null) => void;
  departureDate?: string;
  onAllSoldOut?: (soldOut: boolean) => void;
}

/**
 * Component lựa chọn khách sạn đối tác theo tour.
 * Khách hàng có thể chọn khách sạn rẻ hoặc 5 sao tuỳ ngân sách.
 * Dữ liệu lấy động từ API: GET /api/tours/:tourId/hotels
 */
export const HotelSelector = ({ tourId, selectedHotel, onSelect, departureDate, onAllSoldOut }: Props) => {
  const { data, isLoading } = useQuery<Hotel[]>({
    queryKey: ["tour-hotels", tourId],
    queryFn: () =>
      api.get(`/tours/${tourId}/hotels`).then((r) => r.data.data || []),
    enabled: !!tourId,
  });

  const [detailsHotel, setDetailsHotel] = useState<Hotel | null>(null);

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

  const getImageUrl = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${apiBase}${img}`;
  };

  // Check if a hotel is sold out on the selected departure date
  const isHotelSoldOutOnDate = (hotel: Hotel): boolean => {
    if (hotel.available_rooms === 0) return true;
    if (departureDate && hotel.sold_out_dates && hotel.sold_out_dates.includes(departureDate)) return true;
    return false;
  };

  const defaultHotel = data?.find((h) => h.is_default);
  const otherHotels = data?.filter((h) => !h.is_default) || [];
  const allSoldOut = data?.every((h) => isHotelSoldOutOnDate(h));

  // Notify parent about allSoldOut status
  useEffect(() => {
    onAllSoldOut?.(!!allSoldOut);
  }, [allSoldOut]);

  // Auto-select the default hotel if none is selected, OR unselect if current is sold out
  useEffect(() => {
    // If a hotel is currently selected but just became sold out due to date change
    if (selectedHotel && isHotelSoldOutOnDate(selectedHotel)) {
      const availableOther = otherHotels.find(h => !isHotelSoldOutOnDate(h));
      if (defaultHotel && !isHotelSoldOutOnDate(defaultHotel)) {
        onSelect(defaultHotel);
      } else if (availableOther) {
        onSelect(availableOther);
      } else {
        // Leave it selected so the booking page blocks it, OR unselect it
        // We'll let the user see it's sold out
      }
    } 
    // If NO hotel is selected, auto-select default if available
    else if (defaultHotel && selectedHotel === null) {
      if (!isHotelSoldOutOnDate(defaultHotel)) {
        onSelect(defaultHotel);
      }
    }
  }, [defaultHotel, departureDate, data, selectedHotel]);

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-secondary/30 rounded-xl animate-pulse">
        <div className="h-4 w-40 bg-border rounded mb-2" />
        <div className="h-10 w-full bg-border rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5" />
        Chọn khách sạn lân cận (tùy chọn)
      </label>

      {/* Thông báo khi TẤT CẢ khách sạn đã hết phòng */}
      {allSoldOut && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Hiện tại tất cả khách sạn lân cận đều <strong>không còn phòng</strong> cho tour này tại thời điểm này.
            Vui lòng quay lại sau hoặc chọn tour khác.
          </span>
        </div>
      )}

      <div className="grid gap-2">
        {/* Option mặc định */}
        {defaultHotel ? (
          <label
            key={defaultHotel.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all relative ${
              isHotelSoldOutOnDate(defaultHotel)
                ? "border-border opacity-50 cursor-not-allowed"
                : selectedHotel?.id === defaultHotel.id || selectedHotel === null
                ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                : "border-border hover:border-primary/40 cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name="hotel"
              className="accent-primary mt-0.5"
              disabled={isHotelSoldOutOnDate(defaultHotel)}
              checked={selectedHotel?.id === defaultHotel.id || selectedHotel === null}
              onChange={() => !isHotelSoldOutOnDate(defaultHotel) && onSelect(defaultHotel)}
            />

            {defaultHotel.image && (
              <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0">
                <img src={getImageUrl(defaultHotel.image)!} alt={defaultHotel.name} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="flex-1 min-w-0 pr-6">
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap pr-4">
                {defaultHotel.name}
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Mặc định
                </span>
                <span className="flex items-center text-accent text-xs">
                  {Array.from({ length: defaultHotel.star }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent" />
                  ))}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                📍 {defaultHotel.region || defaultHotel.address}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-xs flex items-center gap-1 font-medium ${
                    isHotelSoldOutOnDate(defaultHotel)
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  <BedDouble className="h-3 w-3" />
                  {isHotelSoldOutOnDate(defaultHotel)
                    ? (departureDate && defaultHotel.sold_out_dates?.includes(departureDate) ? `Hết phòng ngày ${departureDate}` : "Hết phòng")
                    : `${defaultHotel.available_rooms} phòng còn`}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right flex flex-col justify-between items-end h-full">
              <div>
                <div className="text-sm font-bold text-primary">
                  +0đ
                </div>
                <div className="text-[10px] text-muted-foreground">Đã bao gồm</div>
              </div>
            </div>
            
            <button 
              type="button" 
              className="absolute right-2 top-2 p-1.5 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailsHotel(defaultHotel);
              }}
              title="Xem chi tiết khách sạn"
            >
              <Info className="h-4 w-4" />
            </button>
          </label>
        ) : (
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedHotel === null
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="hotel"
              className="accent-primary"
              checked={selectedHotel === null}
              onChange={() => onSelect(null)}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                🏨 Khách sạn mặc định theo tour
              </div>
              <div className="text-xs text-muted-foreground">
                Đã được bao gồm trong giá tour
              </div>
            </div>
            <div className="shrink-0 text-sm font-semibold text-primary">+0đ</div>
          </label>
        )}

        {/* Danh sách khách sạn nâng cấp */}
        {otherHotels.map((hotel) => (
          <label
            key={hotel.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all relative ${
              isHotelSoldOutOnDate(hotel)
                ? "border-border opacity-50 cursor-not-allowed"
                : selectedHotel?.id === hotel.id
                ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                : "border-border hover:border-primary/40 cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name="hotel"
              className="accent-primary mt-0.5"
              disabled={isHotelSoldOutOnDate(hotel)}
              checked={selectedHotel?.id === hotel.id}
              onChange={() => !isHotelSoldOutOnDate(hotel) && onSelect(hotel)}
            />

            {/* Ảnh khách sạn */}
            {hotel.image && (
              <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0">
                <img src={getImageUrl(hotel.image)!} alt={hotel.name} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="flex-1 min-w-0 pr-6">
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap pr-4">
                {hotel.name}
                <span className="flex items-center text-accent text-xs">
                  {Array.from({ length: hotel.star }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent" />
                  ))}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                📍 {hotel.region || hotel.address}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-xs flex items-center gap-1 font-medium ${
                    isHotelSoldOutOnDate(hotel)
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  <BedDouble className="h-3 w-3" />
                  {isHotelSoldOutOnDate(hotel)
                    ? (departureDate && hotel.sold_out_dates?.includes(departureDate) ? `Hết phòng ngày ${departureDate}` : "Hết phòng")
                    : `${hotel.available_rooms} phòng còn`}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right flex flex-col justify-between items-end h-full">
              <div>
                <div className="text-sm font-bold text-primary">
                  +
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(hotel.price_per_night)}
                </div>
                <div className="text-[10px] text-muted-foreground">/đêm</div>
              </div>
            </div>

            <button 
              type="button" 
              className="absolute right-2 top-2 p-1.5 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailsHotel(hotel);
              }}
              title="Xem chi tiết khách sạn"
            >
              <Info className="h-4 w-4" />
            </button>
          </label>
        ))}
      </div>

      <Dialog open={!!detailsHotel} onOpenChange={(open) => !open && setDetailsHotel(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0">
          <DialogTitle className="sr-only">Chi tiết khách sạn</DialogTitle>
          <DialogDescription className="sr-only">Thông tin chi tiết về khách sạn</DialogDescription>
          {detailsHotel && (
            <div className="flex flex-col h-full">
              <div className="relative h-56 bg-secondary w-full">
                {detailsHotel.image ? (
                  <img src={getImageUrl(detailsHotel.image)!} alt={detailsHotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                    <Building2 className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center text-accent">
                      {Array.from({ length: detailsHotel.star }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent" />
                      ))}
                    </span>
                    {detailsHotel.is_default && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                        Khách sạn mặc định
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display">{detailsHotel.name}</h3>
                </div>
              </div>
              
              <div className="p-5 space-y-4 bg-background">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{detailsHotel.address}</p>
                    {detailsHotel.region && <p className="text-xs text-muted-foreground mt-0.5">Khu vực: {detailsHotel.region}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <BedDouble className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span><strong className="text-foreground">{detailsHotel.available_rooms}</strong> phòng trống</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 border border-muted-foreground/30 text-[10px] font-bold">₫</div>
                    {detailsHotel.is_default ? (
                      <span className="text-primary font-semibold">Bao gồm trong tour</span>
                    ) : (
                      <span>Phụ thu: <strong className="text-foreground">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(detailsHotel.price_per_night)}</strong>/đêm</span>
                    )}
                  </div>
                </div>

                {/* Liên hệ info (if user wants to see it, or maybe it's just for admin? The user said "cho phép người dùng xem thông tin chi tiết", we can show it so they know it's legit) */}
                <div className="pt-3 border-t border-border/50 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thông tin liên hệ (Đối tác)</p>
                  {detailsHotel.contact_person && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" /> {detailsHotel.contact_person}
                    </div>
                  )}
                  {detailsHotel.phone && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" /> {detailsHotel.phone}
                    </div>
                  )}
                  {detailsHotel.email && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" /> {detailsHotel.email}
                    </div>
                  )}
                  {!detailsHotel.contact_person && !detailsHotel.phone && !detailsHotel.email && (
                    <p className="text-sm text-muted-foreground italic">Không có thông tin liên hệ cụ thể</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
