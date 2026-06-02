import { MapPin, Shield } from "lucide-react";
import { formatVND } from "@/components/TourCard";
import { Hotel } from "@/components/HotelSelector";

interface BookingSidebarProps {
  tour: any;
  departureDate: string;
  numPeople: number;
  tourPrice: number;
  hotelPrice: number;
  selectedHotel: Hotel | null;
  total: number;
}

const BookingSidebar = ({
  tour,
  departureDate,
  numPeople,
  tourPrice,
  hotelPrice,
  selectedHotel,
  total,
}: BookingSidebarProps) => {
  return (
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
  );
};

export default BookingSidebar;
