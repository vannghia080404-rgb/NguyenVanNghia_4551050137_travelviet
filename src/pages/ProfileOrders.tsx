import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, Users, Eye, XCircle, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatVND } from "@/components/TourCard";
import { cn } from "@/lib/utils";
import ProfileLayout from "@/components/layout/ProfileLayout";
import api from "@/lib/api";

const statusConfig: any = {
  confirmed: { label: "Đã xác nhận", class: "bg-success/15 text-success" },
  completed: { label: "Hoàn thành", class: "bg-primary/15 text-primary" },
  pending: { label: "Chờ xử lý", class: "bg-warning/15 text-warning" },
  contacted: { label: "Đã liên hệ", class: "bg-blue-500/15 text-blue-500" },
  cancelled: { label: "Đã huỷ", class: "bg-destructive/15 text-destructive" },
};

const paymentConfig: any = {
  completed: { label: "Đã thanh toán", class: "bg-success/15 text-success" },
  pending: { label: "Chưa thanh toán", class: "bg-warning/15 text-warning" },
  failed: { label: "Thất bại", class: "bg-destructive/15 text-destructive" },
  refunded: { label: "Hoàn tiền", class: "bg-secondary/15 text-muted-foreground" },
};

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "contacted", label: "Đã liên hệ" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã huỷ" },
];

const ProfileOrders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isRepaying, setIsRepaying] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    }
  });

  const apiOrders = response?.data || [];

  const handleCancel = async (bookingCode: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ đơn đặt này không?")) return;
    
    setIsCancelling(bookingCode);
    try {
      const res = await api.delete(`/bookings/${bookingCode}/cancel`);
      if (res.data.success) {
        toast({ title: "Thành công", description: "Đã huỷ đơn đặt thành công." });
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể huỷ đơn đặt.",
      });
    } finally {
      setIsCancelling(null);
    }
  };

  const handleRepay = async (bookingCode: string) => {
    setIsRepaying(bookingCode);
    try {
      const response = await api.post(`/bookings/${bookingCode}/pay`);
      if (response.data.success && response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        toast({ variant: 'destructive', description: "Phương thức thanh toán này chưa hỗ trợ chuyển hướng tự động, vui lòng liên hệ admin." });
      }
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        description: error.response?.data?.message || "Có lỗi xảy ra khi tạo liên kết thanh toán." 
      });
    } finally {
      setIsRepaying(null);
    }
  };

  const getImageUrl = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000"}${img}`;
  };

  const filtered = activeTab === "all" ? apiOrders : apiOrders.filter((o: any) => o.status === activeTab);

  if (isLoading) {
    return (
      <ProfileLayout title="Đơn đặt tour">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout title="Đơn đặt tour của tôi">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar bg-secondary/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap px-6 py-4 text-sm font-semibold transition-smooth border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {tab.label}
              <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-secondary text-muted-foreground">
                {tab.id === "all" ? apiOrders.length : apiOrders.filter((o: any) => o.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="p-6 space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Chưa có đơn đặt nào</h3>
              <p className="text-muted-foreground mt-2">Bạn chưa có đơn đặt tour nào trong trạng thái này.</p>
              <Button asChild className="mt-6" variant="hero">
                <a href="/tours">Khám phá tour ngay</a>
              </Button>
            </div>
          ) : (
            filtered.map((order: any) => (
              <div key={order.id} className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm hover:border-primary/30 transition-colors">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full sm:w-48 shrink-0">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                      <img src={order.tour.image_url} alt={order.tour.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase backdrop-blur-md", statusConfig[order.status]?.class)}>
                          {statusConfig[order.status]?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-primary mb-1">Mã đơn: {order.booking_code}</div>
                        <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                          <a href={`/tours/${order.tour.slug}`} className="hover:text-primary transition-colors">{order.tour.name}</a>
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Tổng tiền</div>
                        <div className="font-bold text-lg text-primary">{formatVND(order.total_price)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span>{new Date(order.departure_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 opacity-70" />
                        <span>{order.tour.duration} ngày</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 opacity-70" />
                        <span>{order.num_people} người</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4 opacity-70" />
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", paymentConfig[order.payment_status]?.class)}>
                          {paymentConfig[order.payment_status]?.label}
                        </span>
                        <span className="text-xs font-medium text-foreground border-l border-border pl-2">
                          {order.payment_method === 'cash' ? 'Tiền mặt' : 
                           order.payment_method === 'vnpay' ? 'VNPay' :
                           order.payment_method === 'viettel_money' ? 'Viettel Money' : 
                           order.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Khác'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-end gap-3 border-t border-border mt-5">
                      {order.status === 'pending' && order.payment_status === 'pending' && order.payment_method !== 'cash' && (
                        order.payment_receipt ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-success hover:bg-success/90 text-white"
                            onClick={() => navigate(`/payment/transfer/${order.booking_code}?amount=${order.total_price}`)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Đã tải lên Bill
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => {
                              if (order.payment_method === 'vnpay') {
                                handleRepay(order.booking_code);
                              } else {
                                navigate(`/payment/transfer/${order.booking_code}?amount=${order.total_price}`);
                              }
                            }}
                            disabled={isRepaying === order.booking_code}
                          >
                            {isRepaying === order.booking_code ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CreditCard className="h-4 w-4 mr-1.5" />}
                            Thanh toán ngay
                          </Button>
                        )
                      )}
                      {order.canCancel && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
                          onClick={() => handleCancel(order.booking_code)}
                          disabled={isCancelling === order.booking_code}
                        >
                          {isCancelling === order.booking_code ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                          Huỷ đơn
                        </Button>
                      )}
                      {order.status === "completed" && (
                        order.canReview ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-warning/50 text-warning hover:bg-warning/10"
                            onClick={() => navigate(`/tours/${order.tour.slug}?tab=reviews&booking_id=${order.id}`)}
                          >
                            Đánh giá tour
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-success/30 text-success bg-success/5 pointer-events-none"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Đã đánh giá
                          </Button>
                        )
                      )}
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                        <Eye className="h-4 w-4 mr-1.5" /> {expandedId === order.id ? "Thu gọn" : "Xem chi tiết"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Details Expanded */}
                {expandedId === order.id && (
                  <div className="bg-secondary/30 p-6 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">Thông tin hành khách</h4>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary text-muted-foreground font-medium border-b border-border">
                          <tr>
                            <th className="px-4 py-3">STT</th>
                            <th className="px-4 py-3">Họ và tên</th>
                            <th className="px-4 py-3">CCCD/CMND</th>
                            <th className="px-4 py-3">Số điện thoại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {order.travelers?.map((t: any, idx: number) => (
                            <tr key={t.id}>
                              <td className="px-4 py-3">{idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-foreground">{t.full_name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{t.id_card}</td>
                              <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Payment Info in Expanded Details */}
                    {order.payment_method !== 'cash' && order.payment_method !== 'vnpay' && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          Thông tin thanh toán
                        </h4>
                        <div className="bg-card rounded-xl border border-border p-5">
                          <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="flex-1 space-y-3">
                              <div>
                                <span className="text-sm text-muted-foreground">Phương thức:</span>
                                <span className="ml-2 font-medium text-foreground">
                                  {order.payment_method === 'viettel_money' ? 'Viettel Money' : 
                                   order.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 
                                   order.payment_method === 'momo' ? 'Ví MoMo' : order.payment_method}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                <span className={cn("ml-2 font-medium", paymentConfig[order.payment_status]?.class)}>
                                  {paymentConfig[order.payment_status]?.label}
                                </span>
                              </div>
                              <div className="pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/payment/transfer/${order.booking_code}?amount=${order.total_price}`)}
                                >
                                  {order.payment_receipt ? "Xem/Cập nhật hóa đơn chuyển khoản" : "Tải lên hóa đơn chuyển khoản"}
                                </Button>
                              </div>
                            </div>
                            
                            {order.payment_receipt && (
                              <div className="shrink-0 w-full sm:w-48 mt-4 sm:mt-0">
                                <span className="text-sm text-muted-foreground mb-2 block">Hóa đơn đã tải lên:</span>
                                <a href={getImageUrl(order.payment_receipt) || '#'} target="_blank" rel="noopener noreferrer" className="block border border-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                                  <img src={getImageUrl(order.payment_receipt) || ''} alt="Bill" className="w-full h-32 object-cover" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfileOrders;
