import { Bus, Utensils, Camera } from "lucide-react";

type ItineraryDay = {
  title: string;
  description?: string;
  desc?: string;
  meals?: string;
};

interface TourItineraryProps {
  itinerary: ItineraryDay[];
  duration: string;
}

const TourItinerary = ({ itinerary, duration }: TourItineraryProps) => {
  return (
    <>
      <h2 className="font-display text-xl font-semibold text-foreground">Lịch trình chi tiết</h2>
      <p className="mt-2 text-sm text-muted-foreground">Hành trình {duration} đầy trải nghiệm</p>

      <div className="mt-6 space-y-0">
        {itinerary.map((day, i) => (
          <div key={i} className="relative pl-10 pb-8 last:pb-0">
            {/* Timeline line */}
            {i < itinerary.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-border" />
            )}
            {/* Timeline dot */}
            <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-soft">
              {i + 1}
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Ngày {i + 1}</span>
                <span className="text-xs text-muted-foreground">Bữa ăn: {day.meals}</span>
              </div>
              <h3 className="font-display font-semibold text-foreground">{day.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{day.description || day.desc}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  <Bus className="h-3 w-3" /> Di chuyển
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  <Utensils className="h-3 w-3" /> Ẩm thực
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  <Camera className="h-3 w-3" /> Tham quan
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TourItinerary;
