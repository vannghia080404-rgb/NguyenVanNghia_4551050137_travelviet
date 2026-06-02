import { Star, MessageSquare, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TourReviewsProps {
  avgRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>;
  reviews: any[];
  reviewsLoading: boolean;
  isReviewsError: boolean;
  bookingId: string | null;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  hoverRating: number;
  setHoverRating: (rating: number) => void;
  reviewText: string;
  setReviewText: (text: string) => void;
  handleReviewSubmit: () => void;
  isSubmitting: boolean;
  onNavigateToOrders: () => void;
}

const TourReviews = ({
  avgRating,
  totalReviews,
  ratingCounts,
  reviews,
  reviewsLoading,
  isReviewsError,
  bookingId,
  reviewRating,
  setReviewRating,
  hoverRating,
  setHoverRating,
  reviewText,
  setReviewText,
  handleReviewSubmit,
  isSubmitting,
  onNavigateToOrders,
}: TourReviewsProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Đánh giá từ khách hàng</h2>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-accent text-accent" />
          <span className="font-display text-2xl font-bold text-foreground">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">({totalReviews} đánh giá)</span>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="mt-4 bg-card border border-border/50 rounded-xl p-5 shadow-soft">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingCounts[star as keyof typeof ratingCounts] || 0;
          const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3 py-1">
              <span className="text-sm font-medium text-foreground w-6">{star}★</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Review list */}
      <div className="mt-6 space-y-4">
        {reviewsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isReviewsError ? (
          <div className="text-center py-10 bg-destructive/5 rounded-xl border border-dashed border-destructive/20">
            <p className="text-destructive text-sm">Không thể tải đánh giá lúc này. Vui lòng thử lại sau.</p>
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((r: any, i: number) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {(r?.user?.name?.substring(0, 2) || "UN").toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{r?.user?.name || "Người dùng"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r?.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "Gần đây"}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} className={cn("h-4 w-4", j < (r?.rating || 0) ? "fill-accent text-accent" : "text-border")} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r?.comment}</p>

              {r?.admin_reply && (
                <div className="mt-4 p-4 rounded-lg bg-secondary/50 border-l-4 border-primary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white font-bold">AD</div>
                    <span className="text-xs font-bold text-foreground">Phản hồi từ chủ sở hữu</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.replied_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{r.admin_reply}"</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-border">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Write review */}
      {bookingId ? (
        <div className="mt-8 bg-card border border-border/50 rounded-xl p-5 shadow-soft">
          <h3 className="font-display font-semibold text-foreground">Viết đánh giá của bạn</h3>
          <p className="mt-1 text-sm text-muted-foreground">Chia sẻ trải nghiệm của bạn để giúp khách hàng khác</p>

          <div className="mt-4 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, j) => (
              <button
                key={j}
                onMouseEnter={() => setHoverRating(j + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setReviewRating(j + 1)}
              >
                <Star className={cn(
                  "h-7 w-7 transition-smooth cursor-pointer",
                  j < (hoverRating || reviewRating) ? "fill-accent text-accent scale-110" : "text-border hover:text-accent/50"
                )} />
              </button>
            ))}
            {reviewRating > 0 && (
              <span className="ml-2 text-sm font-medium text-foreground">
                {["", "Tệ", "Tạm ổn", "Bình thường", "Tốt", "Tuyệt vời"][reviewRating]}
              </span>
            )}
          </div>

          <Textarea
            placeholder="Chia sẻ cảm nhận của bạn về tour này..."
            className="mt-4 min-h-[100px]"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <Button 
            variant="hero" 
            size="default" 
            className="mt-4" 
            disabled={!reviewRating || !reviewText || isSubmitting}
            onClick={handleReviewSubmit}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Gửi đánh giá
          </Button>
        </div>
      ) : (
        <div className="mt-8 bg-card/50 border border-border/50 rounded-xl p-5 shadow-soft text-center">
          <h3 className="font-display font-medium text-foreground">Bạn đã trải nghiệm tour này?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Vui lòng vào phần Lịch sử đơn hàng trong Hồ sơ của bạn để viết đánh giá cho tour này.</p>
          <Button variant="outline" className="mt-4" onClick={onNavigateToOrders}>
            Đến Lịch sử đơn hàng
          </Button>
        </div>
      )}
    </>
  );
};

export default TourReviews;
