import { ArrowRight, Tag, Crown, Gift, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { loyaltyAPIs } from "@/lib/api";

export default function FeaturedPromotions() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["public-promotions-featured"],
    queryFn: async () => {
      const res = await loyaltyAPIs.getPublicPromotions();
      return res.data;
    }
  });

  const allPromotions = response?.data || [];
  // Take top 3 for the homepage
  const promotions = allPromotions.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-20 relative overflow-hidden bg-accent/5 border-y border-border/30">
        <div className="container relative z-10 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // If no promotions at all, we could hide the section or show a placeholder
  if (promotions.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden bg-accent/5 border-y border-border/30">
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Tag className="w-4 h-4" /> Khuyến Mãi & Tri Ân
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Ưu Đãi Độc Quyền <br className="hidden md:block" />
              <span className="text-primary">Dành Cho Thành Viên</span>
            </h2>
          </div>
          
          <Button asChild variant="outline" className="group rounded-full bg-background">
            <Link to="/promotions">
              Xem tất cả ưu đãi 
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo: any) => (
            <div 
              key={promo.id} 
              onClick={() => window.location.href = `/promotions#promo-${promo.id}`}
              className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-soft bg-card border border-border h-full"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary/50 relative">
                {promo.image ? (
                  <img 
                    src={promo.image} 
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-primary/40 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Gift className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {promo.badge ? (
                  <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full shadow-lg">
                    {promo.badge}
                  </span>
                ) : null}
                {promo.required_rank && (
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Hạng {promo.required_rank.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                {promo.discount_value > 0 && (
                  <div className="text-primary font-bold text-lg mb-1 drop-shadow-md">
                    Giảm {promo.discount_value}{promo.discount_type === 'percent' ? '%' : 'đ'}
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2 drop-shadow-md">
                  {promo.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
