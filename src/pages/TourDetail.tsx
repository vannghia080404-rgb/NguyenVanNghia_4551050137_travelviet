import { useParams, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { X, Star, Clock, Users, MapPin, ChevronRight, CheckCircle2, Info, Calendar, Heart, Share2, Minus, Plus, Image as ImageIcon, Wallet, Bus, Utensils, Camera, Shield, ThumbsUp, Send, Loader2, MessageSquare, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/components/TourCard";
import { cn, getImageUrl } from "@/lib/utils";
import api, { reviewAPIs } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { HotelSelector, Hotel } from "@/components/HotelSelector";
import TourItinerary from "@/components/tour-detail/TourItinerary";
import TourReviews from "@/components/tour-detail/TourReviews";

const tabList = [
  { id: "overview", label: "Tổng quan" },
  { id: "itinerary", label: "Lịch trình" },
  { id: "services", label: "Dịch vụ" },
  { id: "reviews", label: "Đánh giá" },
];

// Mock itinerary
const getItinerary = (durationDays: number) => {
  const days = [
    { title: "Đón khách & Khởi hành", desc: "Xe đón tại điểm hẹn, khởi hành đến điểm đến. Dừng nghỉ ăn trưa trên đường. Check-in khách sạn, tự do khám phá khu vực lân cận.", meals: "Trưa, Tối" },
    { title: "Tham quan & Trải nghiệm", desc: "Tham quan các điểm tham quan chính, trải nghiệm hoạt động văn hoá địa phương. Hướng dẫn viên đồng hành suốt hành trình.", meals: "Sáng, Trưa, Tối" },
    { title: "Khám phá & Di chuyển", desc: "Tiếp tục khám phá các địa điểm nổi bật. Tham gia hoạt động ngoài trời, chụp ảnh lưu niệm. Trải nghiệm ẩm thực đặc trưng.", meals: "Sáng, Trưa, Tối" },
    { title: "Trở về & Tiễn khách", desc: "Ăn sáng tại khách sạn, trả phòng. Mua quà lưu niệm. Xe đưa khách về điểm hẹn. Kết thúc tour, hẹn gặp lại!", meals: "Sáng, Trưa" },
  ];
  return days.slice(0, durationDays || 3);
};

// Removed static mockReviews

const getEmbedUrl = (mapUrl: string, tourName: string, destinationName: string) => {
  if (!mapUrl) return "";

  let url = mapUrl.trim();

  // 0. If it contains an iframe HTML tag, extract the src URL
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }

  // 1. If it's already an embed URL, use it directly!
  if (url.includes("/maps/embed")) {
    return url;
  }

  // 2. Try to extract coordinates like @15.9995511,107.9943547 FIRST to ensure absolute positioning accuracy!
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
  }

  // 3. Try to extract place name from standard google.com/maps/place/Name
  if (url.includes("maps/place/")) {
    try {
      const part = url.split("maps/place/")[1];
      if (part) {
        const placeEncoded = part.split("/")[0];
        const placeDecoded = decodeURIComponent(placeEncoded.replace(/\+/g, " "));
        if (placeDecoded) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(placeDecoded)}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 4. Try to extract query from google.com/maps?q=Name or &q=Name
  try {
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
    }
  } catch (e) {
    // Not a valid full URL
  }

  // 5. Fallback: clean the tour name to get the best search query
  let cleanQuery = tourName;
  // Remove common promotional/meta words in Vietnamese
  cleanQuery = cleanQuery.replace(/(Tour|Combo|Du lịch|Trọn gói|Giá rẻ|Khám phá|Hành trình|Nghỉ dưỡng|Cao cấp|Khách sạn|Vé máy bay)\s*/gi, "");
  // Remove day indicators like "3N2Đ", "2N1Đ", "4 Ngày", etc.
  cleanQuery = cleanQuery.replace(/\d+\s*(ngày|đêm|n|đ)\s*\d*\s*(ngày|đêm|n|đ)*/gi, "");
  // Replace hyphens and pipes with spaces and clean up
  cleanQuery = cleanQuery.replace(/[-|]/g, " ").replace(/\s+/g, " ").trim();

  // Combine with destination
  const searchAddress = cleanQuery + (destinationName ? `, ${destinationName}` : "");
  return `https://maps.google.com/maps?q=${encodeURIComponent(searchAddress)}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
};

const getCleanMapUrl = (mapUrl: string) => {
  if (!mapUrl) return "";
  let url = mapUrl.trim();
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }
  return url;
};

const getDirectionsUrl = (mapUrl: string) => {
  if (!mapUrl) return "#";
  let url = mapUrl.trim();

  // If it's an iframe tag, extract the src URL
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }

  // 1. Match @lat,lng in google maps place url
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordMatch[1]},${coordMatch[2]}`;
  }

  // 2. Match q=lat,lng in URL parameters
  const qCoordMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qCoordMatch) {
    return `https://www.google.com/maps/dir/?api=1&destination=${qCoordMatch[1]},${qCoordMatch[2]}`;
  }

  // 3. Try finding coordinates in the google maps iframe pb parameter
  if (url.includes("pb=")) {
    const pbMatch = url.match(/!3d(-?\d+\.\d+)!2d(-?\d+\.\d+)/) || url.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
    if (pbMatch) {
      if (url.includes("!3d" + pbMatch[1])) {
        return `https://www.google.com/maps/dir/?api=1&destination=${pbMatch[1]},${pbMatch[2]}`;
      } else {
        return `https://www.google.com/maps/dir/?api=1&destination=${pbMatch[2]},${pbMatch[1]}`;
      }
    }
  }

  // Fallback to Google Maps clean URL
  return getCleanMapUrl(mapUrl);
};

const getMapAddress = (mapUrl: string, fallback: string) => {
  if (!mapUrl) return fallback;
  let url = mapUrl.trim();

  // If it contains an iframe HTML tag, extract the src URL
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }

  // 1. Try to extract from !2s... in pb parameter (very common in iframe embeds)
  if (url.includes("!2s")) {
    try {
      const part = url.split("!2s")[1];
      if (part) {
        // Extract up to next ! or end
        const segment = part.split("!")[0].split("&")[0];
        const decoded = decodeURIComponent(segment.replace(/\+/g, " "));
        if (decoded && decoded.trim() && !decoded.includes("=") && decoded.length < 150) {
          return decoded.trim();
        }
      }
    } catch (e) { }
  }

  // 2. Try to extract from /maps/place/Name
  if (url.includes("maps/place/")) {
    try {
      const part = url.split("maps/place/")[1];
      if (part) {
        const placeEncoded = part.split("/")[0];
        const decoded = decodeURIComponent(placeEncoded.replace(/\+/g, " "));
        if (decoded && decoded.trim() && decoded.length < 150) {
          return decoded.trim();
        }
      }
    } catch (e) { }
  }

  // 3. Try to extract query parameter q=
  try {
    if (url.includes("q=")) {
      const urlObj = new URL(url);
      const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
      if (q && q.trim() && q.length < 150) {
        return q.trim();
      }
    }
  } catch (e) { }

  return fallback;
};

const safeParseArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const TourDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      const res = await api.get(`/tours/${slug}`);
      return res.data;
    }
  });

  const tour = response?.data;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get("tab") || "overview";
  const bookingId = searchParams.get("booking_id");
  const [tab, setTab] = useState(initialTab);
  const [adults, setAdults] = useState(2);
  const [liked, setLiked] = useState(false);
  // Khách sạn được chọn (null = dùng khách sạn mặc định theo tour)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [allHotelsSoldOut, setAllHotelsSoldOut] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sync liked state with global wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist").then((r) => r.data.data || []),
    enabled: !!user,
  });

  useEffect(() => {
    if (tour && wishlistData) {
      setLiked(wishlistData.some((t: any) => t.id === tour.id));
    }
  }, [tour, wishlistData]);

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate('/login');
        throw new Error("unauthenticated");
      }
      const res = await api.post('/wishlist/toggle', { tour_id: tour.id });
      return res.data;
    },
    onMutate: async () => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      setLiked(!liked);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!Array.isArray(old)) return old;
        if (!liked) return [...old, tour];
        return old.filter((t: any) => t.id !== tour.id);
      });
      return { previousWishlist };
    },
    onError: (err: any, _, context: any) => {
      if (err.message !== "unauthenticated") {
        setLiked(liked);
        if (context?.previousWishlist) {
          queryClient.setQueryData(["wishlist"], context.previousWishlist);
        }
        toast({ title: "Có lỗi xảy ra, vui lòng thử lại", variant: "destructive" });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: tour.name,
          text: tour.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Đã sao chép liên kết chia sẻ!" });
      }
    } catch (err) {
      console.log("Lỗi chia sẻ:", err);
    }
  };
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: reviewsResponse, isLoading: reviewsLoading, isError: isReviewsError } = useQuery({
    queryKey: ["tour-reviews", tour?.id],
    queryFn: () => reviewAPIs.list(tour?.id || 0),
    enabled: !!tour?.id,
  });

  const reviews = reviewsResponse?.data?.data || [];

  // Calculate dynamic stats from actual reviews
  const totalReviews = reviews.length > 0 ? reviews.length : (tour?.reviews_count || 0);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviews.length)
    : (parseFloat(tour?.rating || "0") || 0);

  // Calculate dynamic rating distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (reviews.length > 0) {
    reviews.forEach((r: any) => {
      const star = Math.round(Number(r.rating || 0));
      if (star >= 1 && star <= 5) {
        ratingCounts[star as keyof typeof ratingCounts]++;
      }
    });
  }

  const handleReviewSubmit = async () => {
    if (!tour) return;
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn cần đăng nhập để viết đánh giá",
      });
      navigate("/login");
      return;
    }

    if (!reviewText.trim() && reviewImages.length === 0) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("tour_id", (tour?.id || 0).toString());
      if (bookingId) formData.append("booking_id", bookingId);
      formData.append("rating", reviewRating.toString());
      formData.append("comment", reviewText);
      reviewImages.forEach((img) => formData.append("images[]", img));

      await reviewAPIs.create(formData);

      setReviewText("");
      setReviewRating(5);
      setReviewImages([]);
      toast({
        title: "Thành công",
        description: "Cảm ơn bạn đã gửi đánh giá!",
      });
      queryClient.invalidateQueries({ queryKey: ["tour-reviews", tour.id] });
      queryClient.invalidateQueries({ queryKey: ["tour", slug] });
    } catch (err: any) {
      toast({
        title: "Thông báo",
        description: err.response?.data?.message || "Không thể gửi đánh giá lúc này,mời khải trải nghiệm tours rồi quay lại",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  if (isError || !tour) return <Navigate to="/tours" replace />;

  const total = tour.price * adults +
    (selectedHotel ? selectedHotel.price_per_night * (tour.duration_days || 1) : 0);
  const itinerary = tour.itineraries?.length > 0 ? tour.itineraries : getItinerary(tour.duration_days || tour.durationDays);
  const defaultImage = "https://images.unsplash.com/photo-1528127269322-5398122536fd?q=80&w=2070&auto=format&fit=crop";
  const rawGallery = [tour.image || defaultImage];
  if (tour.images?.length > 0) {
    rawGallery.push(...tour.images.map((img: any) => img.image_path));
  }
  const gallery = rawGallery.map((img: string) => getImageUrl(img));

  const displayImages = gallery.slice(1, 4); // up to 3 small images
  const hasMoreImages = gallery.length > 4;

  return (
    <main className="bg-background min-h-screen">
      <Helmet>
        <title>{`${tour.name} | TravelViet - Khám phá Việt Nam`}</title>
        <meta name="description" content={tour.description?.substring(0, 160)} />
        <meta property="og:title" content={`${tour.name} | TravelViet`} />
        <meta property="og:description" content={tour.description?.substring(0, 160)} />
        <meta property="og:image" content={gallery[0]} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="keywords" content={`tour ${tour.name}, du lịch ${tour.destination?.name}, travelviet, đặt tour giá rẻ`} />
      </Helmet>
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm flex-wrap">
          <Link to="/" className="text-muted-foreground hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link to="/tours" className="text-muted-foreground hover:text-primary">Tour Việt Nam</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary font-medium line-clamp-1">{tour.name}</span>
        </nav>

        {/* Gallery */}
        <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr] md:auto-rows-[180px] md:grid-rows-2">
          <div className="md:row-span-2 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => { setCurrentImageIndex(0); setShowGallery(true); }}>
            <img src={gallery[0]} alt={tour.name} className="w-full h-full object-cover min-h-[280px] group-hover:scale-105 transition-smooth duration-500" />
            {tour.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold shadow-soft">
                {tour.badge}
              </span>
            )}
          </div>
          {displayImages.map((img, i) => {
            const isLastDisplay = i === displayImages.length - 1;
            const shouldShowOverlay = isLastDisplay;
            return (
              <div key={i} className="rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => { setCurrentImageIndex(i + 1); setShowGallery(true); }}>
                <img src={img} loading="lazy" alt="" className="w-full h-full object-cover min-h-[140px] group-hover:scale-105 transition-smooth duration-500" />
                {shouldShowOverlay && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-opacity hover:bg-black/70">
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-sm font-medium">Xem tất cả {gallery.length} ảnh</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-sm animate-fade-in" onClick={() => setShowGallery(false)}>
            <div className="flex justify-between items-center p-4 text-white" onClick={(e) => e.stopPropagation()}>
              <span className="text-sm font-medium">{currentImageIndex + 1} / {gallery.length}</span>
              <button onClick={() => setShowGallery(false)} className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-smooth">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center relative px-4 pb-4">
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev > 0 ? prev - 1 : gallery.length - 1); }}
                className="absolute left-4 md:left-8 h-12 w-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-smooth z-10"
              >
                <ChevronRight className="h-6 w-6 rotate-180" />
              </button>

              <img
                src={gallery[currentImageIndex]}
                alt={`${tour.name} - ảnh ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain animate-scale-in"
                key={currentImageIndex} // force re-render for animation
                onClick={(e) => e.stopPropagation()}
              />

              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev < gallery.length - 1 ? prev + 1 : 0); }}
                className="absolute right-4 md:right-8 h-12 w-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-smooth z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="h-24 bg-black p-4 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={cn(
                    "relative h-full aspect-video rounded-md overflow-hidden flex-shrink-0 transition-smooth",
                    currentImageIndex === i ? "ring-2 ring-primary opacity-100" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title row */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({totalReviews} đánh giá)</span>
              {(tour.completed_bookings_count || 0) > 0 && (
                <>
                  <span className="text-border mx-1">•</span>
                  <span className="text-success bg-success/10 px-2 py-0.5 rounded text-xs font-semibold">
                    {tour.completed_bookings_count} khách đã trải nghiệm
                  </span>
                </>
              )}
              <button
                onClick={() => toggleWishlist.mutate()}
                className={cn("ml-auto h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-smooth", liked && "border-destructive/40 bg-destructive/5")}
                title={liked ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart className={cn("h-4 w-4", liked ? "fill-destructive text-destructive" : "text-muted-foreground")} />
              </button>
              <button onClick={handleShare} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary" title="Chia sẻ">
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {tour.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {tour.duration}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Tối đa {tour.max_slots || tour.maxSlots || 15} người</span>
              <span className="flex items-center gap-1.5" title={getMapAddress(tour.map_url, tour.destination?.name || tour.destination)}><MapPin className="h-4 w-4 text-primary" /> {getMapAddress(tour.map_url, tour.destination?.name || tour.destination)}</span>
            </div>

            {/* Tabs */}
            <div className="mt-8 border-b border-border">
              <div className="flex gap-8">
                {tabList.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "pb-3 text-sm font-medium transition-smooth relative",
                      tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                    {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="mt-6 animate-fade-in" key={tab}>
              {/* OVERVIEW */}
              {tab === "overview" && (
                <>
                  <h2 className="font-display text-xl font-semibold text-foreground">Về tour này</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{tour.description}</p>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
                      <h3 className="flex items-center gap-2 font-display font-semibold text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Điểm nổi bật
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {safeParseArray(tour.highlights).map((h: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">• {h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
                      <h3 className="flex items-center gap-2 font-display font-semibold text-foreground">
                        <Info className="h-5 w-5 text-accent" />
                        Thông tin cần biết
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {safeParseArray(tour.essentials).map((e: any, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            • {typeof e === 'string' ? e : <><span className="text-foreground/80">{e.label}:</span> {e.value}</>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>


                </>
              )}

              {/* ITINERARY */}
              {tab === "itinerary" && (
                <TourItinerary itinerary={itinerary} duration={tour.duration} />
              )}

              {/* SERVICES */}
              {tab === "services" && (
                <>
                  <h2 className="font-display text-xl font-semibold text-foreground">Dịch vụ bao gồm</h2>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
                      <h3 className="flex items-center gap-2 font-display font-semibold text-foreground text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        Bao gồm
                      </h3>
                      <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                        {(tour.included_services?.length > 0 ? tour.included_services : [
                          "Xe đưa đón máy lạnh đời mới",
                          "Khách sạn 3-4 sao (phòng đôi / twin)",
                          "Các bữa ăn theo chương trình",
                          "Vé tham quan theo lịch trình",
                          "Hướng dẫn viên tiếng Việt / Anh",
                          "Bảo hiểm du lịch toàn chuyến",
                          "Nước uống trên xe",
                        ]).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
                      <h3 className="flex items-center gap-2 font-display font-semibold text-foreground text-destructive">
                        <Info className="h-5 w-5" />
                        Không bao gồm
                      </h3>
                      <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                        {(tour.excluded_services?.length > 0 ? tour.excluded_services : [
                          "Vé máy bay khứ hồi",
                          "Chi phí cá nhân: giặt ủi, điện thoại",
                          "Phụ thu phòng đơn (nếu có)",
                          "Tip cho hướng dẫn viên và tài xế",
                          "Các chi phí không được đề cập",
                        ]).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Minus className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cancellation policy */}
                  <div className="mt-6 bg-card border border-border/50 rounded-xl p-5 shadow-soft">
                    <h3 className="flex items-center gap-2 font-display font-semibold text-foreground">
                      <Shield className="h-5 w-5 text-primary" />
                      Chính sách huỷ tour
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {tour.cancellation_policy?.length > 0 ? (
                        tour.cancellation_policy.map((policy: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{policy}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            <span><strong>Trước 7 ngày:</strong> Hoàn tiền 100%</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                            <Info className="h-4 w-4 text-warning shrink-0" />
                            <span><strong>3-7 ngày:</strong> Hoàn tiền 50%</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <Minus className="h-4 w-4 text-destructive shrink-0" />
                            <span><strong>Dưới 3 ngày:</strong> Không hoàn tiền</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* REVIEWS */}
              {tab === "reviews" && (
                <TourReviews
                  avgRating={avgRating}
                  totalReviews={totalReviews}
                  ratingCounts={ratingCounts}
                  reviews={reviews}
                  reviewsLoading={reviewsLoading}
                  isReviewsError={isReviewsError}
                  bookingId={bookingId}
                  reviewRating={reviewRating}
                  setReviewRating={setReviewRating}
                  hoverRating={hoverRating}
                  setHoverRating={setHoverRating}
                  reviewText={reviewText}
                  setReviewText={setReviewText}
                  reviewImages={reviewImages}
                  setReviewImages={setReviewImages}
                  handleReviewSubmit={handleReviewSubmit}
                  isSubmitting={isSubmitting}
                  onNavigateToOrders={() => navigate("/profile?tab=orders")}
                />
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl shadow-card p-6">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-primary">{formatVND(tour.price)}</span>
                <span className="text-sm text-muted-foreground">/ khách</span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày khởi hành</label>
                  <div className="mt-1.5 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số khách</label>
                  <div className="mt-1.5 flex items-center justify-between h-11 px-3 rounded-lg border border-input bg-background">
                    <span className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-accent" /> {adults} Người lớn
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-semibold w-5 text-center">{adults}</span>
                      <button onClick={() => setAdults(Math.min(15, adults + 1))} className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotel selector */}
              <HotelSelector
                tourId={tour.id}
                selectedHotel={selectedHotel}
                onSelect={setSelectedHotel}
                departureDate={departureDate}
                onAllSoldOut={setAllHotelsSoldOut}
              />

              <div className="mt-6 pt-5 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Người lớn x {adults}</span>
                  <span className="font-medium text-foreground">{formatVND(tour.price * adults)}</span>
                </div>
                {selectedHotel && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Khách sạn ({tour.duration_days || 1} đêm)</span>
                    <span className="font-medium text-amber-600">
                      +{formatVND(selectedHotel.price_per_night * (tour.duration_days || 1))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí dịch vụ</span>
                  <span className="font-medium text-foreground">0đ</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-display font-bold text-lg">Tổng</span>
                  <span className="font-display font-bold text-lg text-primary">{formatVND(total)}</span>
                </div>
              </div>

              {allHotelsSoldOut ? (
                <div className="mt-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
                  <p className="text-sm font-semibold text-destructive">Hết phòng{departureDate ? ` ngày ${new Date(departureDate + 'T00:00:00').toLocaleDateString('vi-VN')}` : ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">Vui lòng chọn ngày khác hoặc quay lại sau</p>
                </div>
              ) : (
                <>
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full mt-5"
                    disabled={
                      selectedHotel &&
                      (selectedHotel.available_rooms === 0 ||
                        (departureDate && selectedHotel.sold_out_dates?.includes(departureDate)))
                    }
                    onClick={() => navigate(`/booking/${tour.slug}?adults=${adults}${selectedHotel ? `&hotel_id=${selectedHotel.id}` : ''}${departureDate ? `&departure_date=${departureDate}` : ''}`)}
                  >
                    <Wallet className="h-4 w-4" /> Đặt tour ngay
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Miễn phí huỷ trước 72 giờ khởi hành
                  </p>
                </>
              )}
            </div>

            {/* Map Widget */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Vị trí & Bản đồ</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {getMapAddress(tour.map_url, tour.destination?.name || tour.destination || "Chi tiết vị trí")}
                  </p>
                </div>
              </div>

              <div className="w-full h-[250px] rounded-xl overflow-hidden border border-border mb-4 bg-muted relative group">
                {tour.map_url || tour.destination?.name || tour.destination ? (
                  <iframe
                    src={getEmbedUrl(tour.map_url, tour.name, tour.destination?.name || tour.destination)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bản đồ tour"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-sm">Chưa có dữ liệu bản đồ</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>

              {(tour.map_url || tour.destination?.name || tour.destination) && (
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 border-border/80 hover:bg-secondary transition-colors"
                  asChild
                >
                  <a href={getDirectionsUrl(tour.map_url)} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4" />
                    Chỉ đường đến điểm tập trung
                  </a>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default TourDetail;
