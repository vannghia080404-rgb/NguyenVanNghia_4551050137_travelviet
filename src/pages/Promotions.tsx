import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loyaltyAPIs } from "@/lib/api";
import { Loader2, Gift, Calendar, Tag, Crown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function Promotions() {
  const { user } = useAuthStore();
  const { data: response, isLoading } = useQuery({
    queryKey: ["public-promotions"],
    queryFn: async () => {
      const res = await loyaltyAPIs.getPublicPromotions();
      return res.data;
    }
  });

  const promotions = Array.isArray(response?.data) ? response.data : [];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-primary', 'ring-offset-4', 'transition-all', 'duration-500');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-primary', 'ring-offset-4');
          }, 2000);
        }
      }, 300);
    }
  }, [isLoading, location.hash]);

  return (
    <div className="min-h-screen flex flex-col pt-24 pb-12">
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Ưu đãi & Khuyến mãi
            </h1>
            <p className="text-muted-foreground text-lg">
              Khám phá những chương trình ưu đãi hấp dẫn dành riêng cho bạn từ TravelViet. 
              {user ? " " + (user.rank ? `Hạng thẻ hiện tại của bạn: ${user.rank.name}.` : "") : " Đăng nhập để nhận thêm nhiều ưu đãi."}
            </p>
          </div>

          {/* Promotions List */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-secondary/20 rounded-3xl text-muted-foreground">
                  Hiện tại chưa có chương trình khuyến mãi nào. Vui lòng quay lại sau!
                </div>
              ) : promotions.map((promo: any) => (
                <div id={`promo-${promo.id}`} key={promo.id} className="bg-card border border-border shadow-soft rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] bg-secondary/50 relative overflow-hidden">
                    {promo.image ? (
                      <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-primary/50 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Gift className="w-16 h-16 mb-2" />
                        <span className="font-medium">Chương trình khuyến mãi</span>
                      </div>
                    )}
                    {promo.badge && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        {promo.badge}
                      </div>
                    )}
                    {promo.discount_value > 0 && (
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-bold px-3 py-1.5 rounded-xl shadow-sm border border-border/50 flex items-center gap-1">
                        <Tag className="w-4 h-4 text-primary" />
                        Giảm {promo.discount_value}{promo.discount_type === 'percent' ? '%' : 'đ'}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {promo.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {promo.description || "Nhanh tay đặt ngay để nhận ưu đãi đặc biệt này từ TravelViet."}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {promo.required_rank && (
                        <div className="flex items-center gap-2 text-sm text-foreground bg-amber-500/10 w-fit px-3 py-1 rounded-lg">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-amber-700">Dành cho hạng {promo.required_rank.name}</span>
                        </div>
                      )}
                      {(promo.start_date || promo.end_date) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {promo.start_date ? new Date(promo.start_date).toLocaleDateString('vi-VN') : 'Bây giờ'} 
                            {' - '} 
                            {promo.end_date ? new Date(promo.end_date).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button className="w-full rounded-xl" onClick={() => navigate(promo.target_url || '/tours')}>
                      Xem Tour áp dụng
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
