import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ChevronLeft, Loader2, SlidersHorizontal, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TourCard from "@/components/TourCard";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import CherryBlossomEffect from "@/components/CherryBlossomEffect";

const durationFilters = [
  { id: "1-3", label: "1-3 ngày", check: (d: number) => d >= 1 && d <= 3 },
  { id: "4-7", label: "4-7 ngày", check: (d: number) => d >= 4 && d <= 7 },
  { id: ">7", label: "Trên 7 ngày", check: (d: number) => d > 7 },
];

const priceFilters = [
  { id: "0-2", label: "Dưới 2 triệu", check: (p: number) => p < 2_000_000 },
  { id: "2-4", label: "Từ 2 - 4 triệu", check: (p: number) => p >= 2_000_000 && p <= 4_000_000 },
  { id: "4-6", label: "Từ 4 - 6 triệu", check: (p: number) => p >= 4_000_000 && p <= 6_000_000 },
  { id: "6-10", label: "Từ 6 - 10 triệu", check: (p: number) => p >= 6_000_000 && p <= 10_000_000 },
  { id: ">10", label: "Trên 10 triệu", check: (p: number) => p > 10_000_000 },
];

const Tours = () => {
  const { data: destResponse } = useQuery({
    queryKey: ['destinations-list'],
    queryFn: () => api.get('/destinations').then(r => r.data.data || [])
  });

  const { data: catResponse } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => api.get('/categories').then(r => r.data.data || [])
  });

  const destinationOptions = ["Tất cả điểm đến", ...(Array.isArray(destResponse) ? destResponse.map((d: any) => d.name) : [])];
  const categoryOptions = ["Tất cả danh mục", ...(Array.isArray(catResponse) ? catResponse.map((c: any) => c.name) : [])];
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("popular");
  
  const regionParam = searchParams.get('region');
  const destinationParam = searchParams.get('destination');
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const idsParam = searchParams.get('ids');
  const maxPriceParam = searchParams.get('max_price');
  const pricesParam = searchParams.get('prices');
  const durationsParam = searchParams.get('durations');

  const { data: response, isLoading } = useQuery({
    queryKey: ['tours', regionParam, destinationParam, categoryParam, searchParam, idsParam, pricesParam, durationsParam, page, sort],
    queryFn: async () => {
      const res = await api.get('/tours', {
        params: {
          region: regionParam,
          destination: destinationParam,
          category: categoryParam,
          search: searchParam,
          ids: idsParam,
          max_price: maxPriceParam,
          prices: pricesParam,
          durations: durationsParam,
          page: page,
          per_page: 6,
          sort: sort
        }
      });
      return res.data;
    }
  });

  const rawData = response?.data;
  const apiTours = Array.isArray(rawData) ? rawData : [];
  const meta = response?.meta;

  const [keyword, setKeyword] = useState(searchParam || "");
  const [destination, setDestination] = useState(destinationOptions[0]);
  const [category, setCategory] = useState(categoryOptions[0]);
  const [priceRange, setPriceRange] = useState<number[]>([maxPriceParam ? Number(maxPriceParam) / 1000000 : 20]); // 0-20 (millions)
  const [selectedPrice, setSelectedPrice] = useState<string>(pricesParam || "");
  const [selectedDurations, setSelectedDurations] = useState<string[]>(durationsParam ? durationsParam.split(',') : []);
  const [showFilters, setShowFilters] = useState(false);
  const [firework, setFirework] = useState<'left' | 'right' | null>(null);

  const triggerFirework = (side: 'left' | 'right', action: () => void) => {
    action();
    setFirework(side);
    setTimeout(() => setFirework(null), 700);
  };

  // Sync destination filter to URL with debounce for keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      if (destination !== destinationOptions[0]) {
        const selectedDest = destResponse?.find((d: any) => d.name === destination);
        if (selectedDest) params.set('destination', selectedDest.slug);
      } else {
        params.delete('destination');
      }

      if (category !== categoryOptions[0]) {
        const selectedCat = catResponse?.find((c: any) => c.name === category);
        if (selectedCat) params.set('category', selectedCat.slug);
      } else {
        params.delete('category');
      }
      
      if (keyword.trim()) {
        params.set('search', keyword.trim());
      } else {
        params.delete('search');
      }

      setSearchParams(params, { replace: true });
      setPage(1);
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [destination, category, keyword, searchParams, setSearchParams]);

  // Sync from URL to local state if exists
  useEffect(() => {
    if (searchParam) setKeyword(searchParam);
    if (destinationParam) {
      const found = destResponse?.find((d: any) => d.slug === destinationParam);
      if (found) setDestination(found.name);
    }
    if (categoryParam) {
      const found = catResponse?.find((c: any) => c.slug === categoryParam);
      if (found) setCategory(found.name);
    }
  }, [destinationParam, categoryParam, searchParam, destResponse, catResponse]);

  // Local filter for anything beyond API filtering, if necessary.
  // Actually, since we now filter by max_price and durations in API, we can just rely on API for pagination correctness.
  // But we still apply local filter just in case the API takes time or we want immediate feedback before "Áp dụng" is clicked.
  const filtered = useMemo(() => {
    return apiTours.filter((t: any) => {
      if (keyword && !t.name.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (destination !== destinationOptions[0] && t.destination?.name !== destination && t.destination !== destination) return false;
      if (category !== categoryOptions[0] && t.category?.name !== category && t.category !== category) return false;
      if (t.price > priceRange[0] * 1_000_000) return false;
      
      if (selectedPrice) {
        const activePriceFilter = priceFilters.find(f => f.id === selectedPrice);
        if (activePriceFilter && !activePriceFilter.check(t.price)) return false;
      }
      
      if (selectedDurations.length > 0) {
        const filters = durationFilters.filter((f) => selectedDurations.includes(f.id));
        if (!filters.some((f) => f.check(t.duration_days || t.durationDays))) return false;
      }
      return true;
    }).sort((a: any, b: any) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.reviews_count - a.reviews_count;
    });
  }, [apiTours, keyword, destination, category, priceRange, selectedPrice, selectedDurations, sort]);

  const toggleDuration = (id: string) => {
    setSelectedDurations((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const selectPrice = (id: string) => {
    setSelectedPrice((prev) => prev === id ? "" : id); // Toggle off if clicking the same, otherwise switch
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (priceRange[0] < 20) {
      params.set('max_price', (priceRange[0] * 1000000).toString());
    } else {
      params.delete('max_price');
    }

    if (selectedPrice) {
      params.set('prices', selectedPrice);
    } else {
      params.delete('prices');
    }

    if (selectedDurations.length > 0) {
      params.set('durations', selectedDurations.join(','));
    } else {
      params.delete('durations');
    }

    setSearchParams(params, { replace: true });
    setPage(1);
    setShowFilters(false);
  };

  return (
    <main className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="container pt-6 pb-4">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary font-medium">Tour du lịch</span>
        </nav>
      </div>

      <div className="container pb-20">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
          >
            {showFilters ? <FilterX className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="relative">
          {/* Floating Sidebar Overlay */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-0 z-50 w-[320px] bg-card/98 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] p-6"
              >
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <span className="text-base font-display font-semibold text-foreground">Bộ lọc</span>
                </div>

                <div className="mt-5 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Keyword</label>
                    <div className="mt-2 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm tên tour..."
                        className="pl-9 bg-background border-input"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Điểm đến</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                    >
                      {destinationOptions.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Danh mục</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                    >
                      {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Giới hạn mức giá (Tối đa)</label>
                    <Slider
                      className="mt-4"
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={1}
                      max={20}
                      step={1}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>1.000.000đ</span>
                      <span>{priceRange[0]}.000.000đ</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Chọn mức giá</label>
                    <div className="mt-3 space-y-2.5">
                      {priceFilters.map((p) => (
                        <label key={p.id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedPrice === p.id}
                            onCheckedChange={() => selectPrice(p.id)}
                            className="rounded-full"
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Duration</label>
                    <div className="mt-3 space-y-2.5">
                      {durationFilters.map((d) => (
                        <label key={d.id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedDurations.includes(d.id)}
                            onCheckedChange={() => toggleDuration(d.id)}
                          />
                          {d.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleApplyFilters}>Áp dụng bộ lọc</Button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

        {/* List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-bold text-foreground">{filtered.length} tours</span> tương ứng
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:ring-1 outline-none"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-border/50 py-24 text-center shadow-2xl">
              <FilterX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-xl font-medium">Không tìm thấy tour phù hợp với bộ lọc của bạn.</p>
              <Button 
                variant="link" 
                className="text-primary mt-2 text-lg"
                onClick={() => {
                  setSearchParams({});
                  setKeyword("");
                  setPriceRange([20]);
                  setDestination(destinationOptions[0]);
                  setSelectedDurations([]);
                }}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((t: any, i: number) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 12,
                    delay: (i % 6) * 0.08
                  }}
                  className="group"
                >
                  <TourCard tour={t} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Fixed Navigation Arrows - Sử dụng Portal để tránh bị transform từ PageTransition làm trôi nút */}
          {createPortal(
            <>
              {/* ======== NÚT TRÁI ======== */}
              <div
                className="fixed left-6 top-1/2 -translate-y-1/2 z-[9999]"
                style={{
                  opacity: (meta && meta.last_page > 1) ? 1 : 0,
                  pointerEvents: (meta && meta.last_page > 1) ? 'auto' : 'none',
                  transition: 'opacity 0.4s ease',
                  perspective: '600px',
                  overflow: 'visible',
                }}
              >
                <CherryBlossomEffect active={firework === 'left'} onComplete={() => setFirework(null)} />
                <motion.button
                  onClick={() => triggerFirework('left', () => setPage(prev => Math.max(1, prev - 1)))}
                  disabled={page === 1}
                  animate={{
                    y: [0, -10, 0],
                    boxShadow: [
                      '0 0 16px 4px rgba(251,191,36,0.45), 0 4px 20px rgba(0,0,0,0.3)',
                      '0 0 36px 12px rgba(251,191,36,0.75), 0 6px 28px rgba(0,0,0,0.4)',
                      '0 0 16px 4px rgba(251,191,36,0.45), 0 4px 20px rgba(0,0,0,0.3)',
                    ],
                  }}
                  transition={{
                    y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                    boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                    scale: { type: 'spring', stiffness: 400, damping: 18 },
                    rotateY: { type: 'spring', stiffness: 350, damping: 20 },
                    rotateX: { type: 'spring', stiffness: 350, damping: 20 },
                  }}
                  whileHover={{ scale: 1.15, rotateY: 10 }}
                  whileTap={{ scale: 0.75, rotateY: -35, rotateX: 15 }}
                  className="relative h-16 w-16 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(245,158,11,0.9) 50%, rgba(180,83,9,0.85) 100%)',
                    boxShadow: '0 0 20px 6px rgba(251,191,36,0.5), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.35)',
                    transformStyle: 'preserve-3d',
                    border: '1.5px solid rgba(255,230,100,0.6)',
                  }}
                >
                  <ChevronLeft className="h-7 w-7 stroke-[2.5] drop-shadow-lg" />
                </motion.button>
              </div>

              {/* ======== NÚT PHẢI ======== */}
              <div
                className="fixed right-6 top-1/2 -translate-y-1/2 z-[9999]"
                style={{
                  opacity: (meta && meta.last_page > 1) ? 1 : 0,
                  pointerEvents: (meta && meta.last_page > 1) ? 'auto' : 'none',
                  transition: 'opacity 0.4s ease',
                  perspective: '600px',
                  overflow: 'visible',
                }}
              >
                <CherryBlossomEffect active={firework === 'right'} onComplete={() => setFirework(null)} />
                <motion.button
                  onClick={() => triggerFirework('right', () => setPage(prev => Math.min(meta!.last_page, prev + 1)))}
                  disabled={!meta || page === meta.last_page}
                  animate={{
                    y: [0, -10, 0],
                    boxShadow: [
                      '0 0 16px 4px rgba(251,191,36,0.45), 0 4px 20px rgba(0,0,0,0.3)',
                      '0 0 36px 12px rgba(251,191,36,0.75), 0 6px 28px rgba(0,0,0,0.4)',
                      '0 0 16px 4px rgba(251,191,36,0.45), 0 4px 20px rgba(0,0,0,0.3)',
                    ],
                  }}
                  transition={{
                    y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 },
                    boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 },
                    scale: { type: 'spring', stiffness: 400, damping: 18 },
                    rotateY: { type: 'spring', stiffness: 350, damping: 20 },
                    rotateX: { type: 'spring', stiffness: 350, damping: 20 },
                  }}
                  whileHover={{ scale: 1.15, rotateY: -10 }}
                  whileTap={{ scale: 0.75, rotateY: 35, rotateX: 15 }}
                  className="relative h-16 w-16 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(245,158,11,0.9) 50%, rgba(180,83,9,0.85) 100%)',
                    boxShadow: '0 0 20px 6px rgba(251,191,36,0.5), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.35)',
                    transformStyle: 'preserve-3d',
                    border: '1.5px solid rgba(255,230,100,0.6)',
                  }}
                >
                  <ChevronRight className="h-7 w-7 stroke-[2.5] drop-shadow-lg" />
                </motion.button>
              </div>
            </>,
            document.body
          )}

          {/* Number Pagination (Arrows removed from here) */}
          {meta && meta.last_page > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-10 w-10 rounded-full font-medium transition-smooth",
                    page === p ? "bg-primary text-primary-foreground shadow-soft" : "border border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
);
};

export default Tours;
