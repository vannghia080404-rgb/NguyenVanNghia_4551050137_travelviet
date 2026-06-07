import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Heart, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/TourCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { toast } from "sonner";

const Wishlist = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch wishlist from API
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist").then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const wishlist = Array.isArray(rawData) ? rawData : [];

  // Remove single tour
  const removeMutation = useMutation({
    mutationFn: (tourId: number) => api.delete(`/wishlist/${tourId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Đã xóa khỏi danh sách yêu thích");
    },
    onError: () => toast.error("Xóa thất bại, vui lòng thử lại"),
  });

  // Clear all tours
  const clearAllMutation = useMutation({
    mutationFn: () => api.delete('/wishlist/clear-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Đã xóa tất cả tour yêu thích");
    },
    onError: () => toast.error("Xóa thất bại, vui lòng thử lại"),
  });

  // Not logged in
  if (!isAuthenticated) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
            Đăng nhập để xem tour yêu thích
          </h2>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            Lưu các tour bạn thích để dễ dàng tìm lại sau.
          </p>
          <Button variant="hero" size="lg" className="mt-6" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary font-medium">Tour yêu thích</span>
        </nav>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Heart className="h-8 w-8 text-destructive fill-destructive" />
              Tour yêu thích
            </h1>
            <p className="mt-2 text-muted-foreground">
              Bạn có <span className="font-semibold text-foreground">{wishlist.length}</span> tour trong danh sách yêu thích
            </p>
          </div>
          {wishlist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
            >
              {clearAllMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Xoá tất cả
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="mt-12 bg-card rounded-2xl border border-border/50 py-20 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">Chưa có tour yêu thích</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Nhấn vào biểu tượng trái tim trên các tour bạn thích để lưu vào đây.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-6">
              <Link to="/tours">Khám phá tour ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((tour) => (
              <div key={tour.id} className="relative group/card">
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
