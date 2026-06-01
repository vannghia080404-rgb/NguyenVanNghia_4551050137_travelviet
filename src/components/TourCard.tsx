import { useNavigate } from "react-router-dom";
import { Star, Clock, Heart, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import Atropos from 'atropos/react';
import 'atropos/css';

export const formatVND = (n: any) => {
  const amount = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(amount) || amount === null || amount === undefined) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

const TourCard = ({ tour, compact }: { tour: any; compact?: boolean }) => {
  const [liked, setLiked] = useState(() => {
    if (tour.is_liked !== undefined) return tour.is_liked;
    return window.location.pathname.includes('/wishlist');
  });
  
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist").then((r) => r.data.data || []),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (tour && wishlistData && isAuthenticated) {
      setLiked(wishlistData.some((t: any) => t.id === tour.id));
    }
  }, [tour, wishlistData, isAuthenticated]);

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        navigate('/login');
        throw new Error("unauthenticated");
      }
      const res = await api.post('/wishlist/toggle', { tour_id: tour.id });
      return res.data;
    },
    onMutate: async () => {
      if (!isAuthenticated) return;
      
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      
      setLiked(!liked);
      
      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!Array.isArray(old)) return old;
        if (!liked) {
          return [...old, tour];
        } else {
          return old.filter((t: any) => t.id !== tour.id);
        }
      });
      
      return { previousWishlist };
    },
    onSuccess: () => {
      // Silent update — no toast spam like big sites
    },
    onError: (err: any, _, context: any) => {
      if (err.message !== "unauthenticated") {
        setLiked(liked); // Revert
        if (context?.previousWishlist) {
          queryClient.setQueryData(["wishlist"], context.previousWishlist);
        }
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  });

  if (!tour) return null;

  const tourUrl = `/tours/${tour.slug || ''}`;

  return (
    <div className={cn("block h-full group relative", compact && "h-auto")}>
      {/* ✅ Nút yêu thích độc lập (Floating Wishlist Button OUTSIDE Atropos to prevent Atropos click interception) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation(); // Ngăn click bubble
          toggleWishlist.mutate();
        }}
        className="absolute top-5 right-5 h-10 w-10 rounded-xl bg-background/45 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-background/60 transition-colors z-30 shadow-md"
        style={{ isolation: 'isolate' }}
        aria-label="Yêu thích"
      >
        <motion.div animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.3, ease: "easeOut" }}>
          <Heart className={cn("h-5 w-5 transition-colors", liked ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </motion.div>
      </motion.button>

      <Atropos
        className="h-full group cursor-pointer"
        activeOffset={40}
        shadow={false}
        shadowOffset={0}
        highlight={false}
        onClick={() => navigate(tourUrl)}
      >
        <div
          className={cn(
            "block h-full bg-card rounded-[2.5rem] overflow-hidden relative transition-all duration-500",
            "border border-border hover:border-primary/50",
            "shadow-card hover:shadow-glow"
          )}
        >
          {/* Glow Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Phần ảnh */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={getImageUrl(tour.image)}
              alt={tour.name || 'Tour'}
              loading="lazy"
              data-atropos-offset="-5"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
            
            {tour.badge && (
              <span 
                data-atropos-offset="10"
                className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(251,191,36,0.3)]"
              >
                {tour.badge}
              </span>
            )}
          </div>

          {/* Phần nội dung */}
          <div className="p-7" data-atropos-offset="5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 rounded-lg border border-accent/20">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="font-bold text-accent text-xs">{(parseFloat(tour.rating || "0") || 0).toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-tight">({tour.reviews_count || tour.reviews || 0} đánh giá)</span>
            </div>

            <h3 className="font-display font-bold text-xl text-foreground line-clamp-2 min-h-[3.5rem] transition-colors leading-tight hover:text-primary cursor-pointer">
              {tour.name || 'Tour du lịch'}
            </h3>

            <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/40 rounded-full border border-border">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                {tour.duration}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/40 rounded-full border border-border">
                <MapPin className="h-3.5 w-3.5 text-primary/70" />
                {tour.destination?.name || "Việt Nam"}
              </div>
            </div>

            <div className={cn("mt-8 flex items-center justify-between", compact && "flex-col items-stretch gap-4")}>
              <div className="flex flex-col">
                {(tour.old_price || tour.oldPrice) && (
                  <span className="text-[11px] text-muted-foreground line-through font-medium tracking-tight">{formatVND(tour.old_price || tour.oldPrice)}</span>
                )}
                <span className="font-display font-extrabold text-2xl text-primary tracking-tight">{formatVND(tour.price)}</span>
              </div>
              <Button
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation(); // Ngăn click bubble
                  navigate(tourUrl);
                }}
                className="rounded-xl px-6 py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_24px_rgba(251,191,36,0.4)] transition-all z-10 relative"
              >
                Đặt Ngay
              </Button>
            </div>
          </div>
        </div>
      </Atropos>
    </div>
  );
};

export default TourCard;
