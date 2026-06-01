import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { loyaltyAPIs } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const { data: response } = useQuery({
    queryKey: ["featured-promotions"],
    queryFn: async () => {
      const res = await loyaltyAPIs.getPublicPromotions({ featured: 1 });
      return res.data;
    }
  });

  const featuredPromo = response?.data && response.data.length > 0 ? response.data[0] : null;

  useEffect(() => {
    if (featuredPromo) {
      // Check if user has dismissed this exact promotion ID in this session
      const hasDismissed = sessionStorage.getItem(`hide_promo_v3_${featuredPromo.id}`);
      
      if (!hasDismissed) {
        // Auto show after 2 seconds
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [featuredPromo]);

  const handleClose = () => {
    setIsVisible(false);
    if (featuredPromo) {
      // Save to session storage to prevent showing again in the same tab
      sessionStorage.setItem(`hide_promo_v3_${featuredPromo.id}`, 'true');
    }
  };

  const handleView = () => {
    handleClose();
    navigate(`/promotions#promo-${featuredPromo.id}`);
  };

  if (!featuredPromo) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[9999] w-[350px] max-w-[calc(100vw-32px)]"
        >
          <div className="relative bg-card rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-primary/20 overflow-hidden group">
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image Banner */}
            <div className="h-32 relative overflow-hidden bg-primary/10">
              {featuredPromo.image ? (
                <img 
                  src={featuredPromo.image} 
                  alt={featuredPromo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/30">
                  <Gift className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              
              <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                  <Gift className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg leading-tight text-white drop-shadow-md truncate">
                  {featuredPromo.title}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-2">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {featuredPromo.description || "Nhanh tay nhận ngay ưu đãi hấp dẫn đang diễn ra."}
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Bỏ qua
                </Button>
                <Button onClick={handleView} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  Xem ngay
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
