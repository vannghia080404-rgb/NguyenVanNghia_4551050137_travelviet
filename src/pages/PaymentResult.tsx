import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, ArrowRight, Home, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const PaymentResult = () => {
  const [params] = useSearchParams();
  const status = params.get("status") || "success";
  const tourName = params.get("tour") || "Tour du lịch";
  const amount = Number(params.get("amount")) || 0;

  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "bg-success/15 text-success",
      title: "Đặt tour thành công!",
      subtitle: "Cảm ơn bạn đã đặt tour. Chúng tôi đã gửi email xác nhận đến hộp thư của bạn.",
      orderStatus: "Đã thanh toán",
      orderStatusClass: "bg-success/15 text-success",
    },
    pending: {
      icon: Clock,
      iconClass: "bg-warning/15 text-warning",
      title: "Đang chờ thanh toán",
      subtitle: "Đơn đặt tour đã được tạo. Vui lòng hoàn tất thanh toán trong vòng 24 giờ.",
      orderStatus: "Chờ thanh toán",
      orderStatusClass: "bg-warning/15 text-warning",
    },
    failed: {
      icon: XCircle,
      iconClass: "bg-destructive/15 text-destructive",
      title: "Thanh toán thất bại",
      subtitle: "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
      orderStatus: "Thanh toán lỗi",
      orderStatusClass: "bg-destructive/15 text-destructive",
    },
  }[status] || config.success;

  const Icon = config.icon;

  return (
    <main className="bg-background min-h-screen flex items-center justify-center py-12">
      <div className="container max-w-xl">
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-8 md:p-10 text-center animate-fade-in">
          {/* Icon */}
          <div className={cn("h-20 w-20 rounded-full flex items-center justify-center mx-auto", config.iconClass)}>
            <Icon className="h-10 w-10" />
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold text-foreground">{config.title}</h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">{config.subtitle}</p>

          {/* Order details */}
          <div className="mt-8 rounded-xl bg-secondary/40 border border-border/50 p-5 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã đơn hàng</span>
              <span className="font-mono font-semibold text-primary">#BK-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tour</span>
              <span className="font-medium text-foreground text-right max-w-[200px] truncate">{tourName}</span>
            </div>
            {amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền</span>
                <span className="font-display font-bold text-primary">{formatVND(amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", config.orderStatusClass)}>
                {config.orderStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phương thức</span>
              <span className="font-medium text-foreground">VNPay</span>
            </div>
          </div>

          {/* Email notification */}
          {status === "success" && (
            <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground bg-accent-soft/60 border border-accent/20 rounded-lg p-3 text-left">
              <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {status === "success" ? (
              <>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/profile/orders"><FileText className="h-4 w-4" /> Xem đơn đặt</Link>
                </Button>
                <Button asChild variant="hero" size="lg" className="flex-1">
                  <Link to="/tours"><ArrowRight className="h-4 w-4" /> Khám phá thêm tour</Link>
                </Button>
              </>
            ) : status === "pending" ? (
              <>
                <Button variant="hero" size="lg" className="flex-1">
                  Thanh toán ngay
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/profile/orders"><FileText className="h-4 w-4" /> Xem đơn đặt</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" className="flex-1">
                  Thử lại
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/"><Home className="h-4 w-4" /> Về trang chủ</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentResult;
