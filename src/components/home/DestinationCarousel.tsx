import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import hoianCustom from "@/assets/hoi-an-custom.jpg";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const DestinationCarousel = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['popular-destinations'],
    queryFn: async () => {
      const res = await api.get('/destinations?featured=1');
      return res.data;
    }
  });

  const slides = response?.data || [];
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const slideNext = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const slidePrev = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(slideNext, 6000);
      return () => clearInterval(timer);
    }
  }, [slideNext, slides.length]);

  // Reset current index if it becomes out of bounds
  useEffect(() => {
    if (current >= slides.length && slides.length > 0) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[480px] rounded-[2rem] bg-secondary/20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-[2rem] overflow-hidden shadow-2xl bg-black group/carousel border border-white/5">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 200, damping: 25 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.8 }
          }}
          className="absolute inset-0"
        >
          {/* Background Image with Zoom effect */}
          <div className="absolute inset-0">
            <img
              src={slides[current].image || hoianCustom}
              alt={slides[current].name}
              className="w-full h-full object-cover"
            />
            {/* Multiple Overlays for Depth */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].color || 'from-blue-600/20'} to-transparent opacity-60`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-xl"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-glow">
                Điểm đến phổ biến
              </span>
              <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl mb-4">
                {slides[current].name}
              </h3>
              <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6 max-w-md drop-shadow-lg line-clamp-2">
                {slides[current].description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="hero" size="xl" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl group/btn">
                  <Link to="/tours" className="flex items-center gap-3">
                    Xem Tour Nổi Bật
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="rounded-2xl bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                  <Link to={`/tours?destination=${slides[current].slug}`}>
                    Tìm Hiểu Thêm
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between z-30 pointer-events-none">
        <button
          onClick={slidePrev}
          className="h-12 w-12 rounded-xl bg-black/20 hover:bg-primary/90 text-white flex items-center justify-center backdrop-blur-lg border border-white/10 transition-all pointer-events-auto hover:scale-110 active:scale-95 opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={slideNext}
          className="h-12 w-12 rounded-xl bg-black/20 hover:bg-primary/90 text-white flex items-center justify-center backdrop-blur-lg border border-white/10 transition-all pointer-events-auto hover:scale-110 active:scale-95 opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`transition-all duration-500 rounded-full ${
              i === current ? "w-10 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-white/10 w-full z-30">
        <motion.div
          key={current}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-full bg-primary/60"
        />
      </div>
    </div>
  );
};

export default DestinationCarousel;
