import React, { useState, useEffect, useRef } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/components/TourCard';

// ──────────────── EASING FUNCTIONS ────────────────
const easeOutBounce = (x: number): number => {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  else return n1 * (x -= 2.625 / d1) * x + 0.984375;
};
const easeOutElastic = (x: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};
const easeOutBack = (x: number): number => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easings = [easeOutBounce, easeOutElastic, easeOutBack];

// ──────────────── TYPES ────────────────
interface Product {
  id: string | number;
  name: string;
  description?: string;
  image: string;
  price: number;
  oldPrice?: number;
  badge?: 'NEW' | 'HOT' | 'SALE';
  rating: number;
  reviewsCount: number;
}

interface FallingProductGridProps {
  products: Product[];
  categories: string[];
  onCategoryChange?: (category: string) => void;
}

const FallingProductGrid: React.FC<FallingProductGridProps> = ({ products, categories, onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);
  const [animatingStates, setAnimatingStates] = useState<Record<string, { opacity: number, y: number, scale: number }>>({});
  const requestRef = useRef<number>();
  const cardStates = useRef<Record<string, { startTime: number, delay: number, easingIdx: number, type: 'in' | 'out' }>>({});

  useEffect(() => {
    const now = performance.now();
    const oldIds = displayProducts.map(p => String(p.id));
    const newIds = products.map(p => String(p.id));
    
    // Check if products actually changed
    const isSame = oldIds.length === newIds.length && oldIds.every((id, idx) => id === newIds[idx]);
    if (isSame && Object.keys(cardStates.current).length > 0) return;

    // Start Exit Animation for old items
    const exitStates: Record<string, any> = {};
    displayProducts.forEach((p, i) => {
      exitStates[p.id] = { startTime: now, delay: i * 30, easingIdx: 2, type: 'out' };
    });
    cardStates.current = { ...cardStates.current, ...exitStates };

    // Wait 300ms then swap and start Enter Animation
    const timeout = setTimeout(() => {
      const startNow = performance.now();
      setDisplayProducts(products);
      const enterStates: Record<string, any> = {};
      products.forEach((p, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        enterStates[p.id] = { 
          startTime: startNow, 
          delay: (row * 100) + (col * 50), 
          easingIdx: i % easings.length, 
          type: 'in' 
        };
      });
      cardStates.current = enterStates;
    }, 300);

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timeout);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [products]);

  const animate = (time: number) => {
    const updatedStates: Record<string, any> = {};
    let active = false;

    displayProducts.forEach((p) => {
      const state = cardStates.current[p.id];
      if (!state) return;

      const elapsed = time - state.startTime;
      const progress = Math.max(0, Math.min((elapsed - state.delay) / 800, 1));

      if (progress < 1) active = true;

      if (state.type === 'in') {
        const t = easings[state.easingIdx](progress);
        updatedStates[p.id] = {
          opacity: Math.min(progress * 2, 1),
          y: -150 + (150 * t),
          scale: 0.93 + (0.07 * t)
        };
      } else {
        // Fade out & slide down
        updatedStates[p.id] = {
          opacity: 1 - progress,
          y: 20 * progress,
          scale: 1 - (0.05 * progress)
        };
      }
    });

    setAnimatingStates(updatedStates);
    if (active || Object.keys(updatedStates).length > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  return (
    <div className="w-full space-y-10">
      <div className="flex flex-wrap gap-2.5 items-center justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); onCategoryChange?.(cat); }}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 border",
              activeCategory === cat 
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6" 
           style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gridAutoRows: '1fr' }}>
        {displayProducts.map((p) => {
          const anim = animatingStates[p.id] || { opacity: 0, y: -150, scale: 0.93 };
          return (
            <div key={p.id} style={{ opacity: anim.opacity, transform: `translateY(${anim.y}px) scale(${anim.scale})`, willChange: 'transform, opacity' }}>
              <div className="group h-full flex flex-col bg-card rounded-[1.5rem] border border-border/50 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-500 relative">
                <div className="relative aspect-[1/1] overflow-hidden bg-muted/20">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  {p.badge && (
                    <span className={cn("absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter", 
                      p.badge === 'SALE' ? "bg-red-500 text-white" : p.badge === 'HOT' ? "bg-orange-500 text-white" : "bg-blue-500 text-white")}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-foreground">{p.rating}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">{p.name}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mb-4">{p.description}</p>
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40">
                    <div className="flex flex-col">
                      {p.oldPrice && <span className="text-[9px] text-muted-foreground line-through">{formatVND(p.oldPrice)}</span>}
                      <span className="text-base font-black text-primary">{formatVND(p.price)}</span>
                    </div>
                    <button className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FallingProductGrid;
