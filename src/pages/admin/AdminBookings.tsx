import { useState } from "react";
import { Download, ChevronDown, Loader2, Eye, Receipt, CreditCard, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { adminBookingAPIs } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: number;
  booking_code: string;
  user: { id: number; name: string; email: string; bank_name?: string; bank_account_no?: string; bank_account_name?: string };
  tour: { id: number; name: string };
  departure_date: string;
  num_people: number;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_receipt?: string;
  admin_notes?: string;
  created_at: string;
  travelers: any[];
}

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã liên hệ", value: "contacted" },
  { label: "Xác nhận", value: "confirmed" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Hủy", value: "cancelled" },
];

const paymentStatusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chưa thanh toán", value: "pending" },
  { label: "Đã thanh toán", value: "completed" },
  { label: "Thất bại", value: "failed" },
  { label: "Hoàn tiền", value: "refunded" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  contacted: "bg-blue-500/15 text-blue-500",
  confirmed: "bg-success/15 text-success",
  completed: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

const paymentStatusStyles: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  refunded: "bg-secondary/15 text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  contacted: "Đã liên hệ",
  confirmed: "Xác nhận",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Chưa thanh toán",
  completed: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Hoàn tiền",
};

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const AdminBookings = () => {
  const [filter, setFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedStatus, setExpandedStatus] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [expandedPaymentStatus, setExpandedPaymentStatus] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
  const getImageUrl = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${apiBase}${img}`;
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-bookings", filter, paymentFilter, search],
    queryFn: async () => {
      const res = await adminBookingAPIs.list({
        status: filter,
        payment_status: paymentFilter,
        search,
      });
      return res.data;
    },
  });

  const bookings = response?.data?.data || [];

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminBookingAPIs.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Thành công", description: "Trạng thái đã được cập nhật" });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminBookingAPIs.updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Thành công", description: "Trạng thái thanh toán đã được cập nhật" });
      if (selectedBooking) {
        setSelectedBooking(null); // Close modal on success if open
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật thanh toán",
        variant: "destructive",
      });
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      adminBookingAPIs.updateNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Thành công", description: "Ghi chú đã được lưu lại" });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể lưu ghi chú",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout
        title="Quản lý Đặt chỗ"
        subtitle="Tất cả đơn đặt tour và trạng thái thanh toán"
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      label: "Tổng đơn",
      value: bookings.length || 0,
      color: "text-primary",
    },
    {
      label: "Xác nhận",
      value: bookings.filter((b: Booking) => b.status === "confirmed").length || 0,
      color: "text-success",
    },
    {
      label: "Chờ xử lý",
      value: bookings.filter((b: Booking) => b.status === "pending").length || 0,
      color: "text-warning",
    },
    {
      label: "Hủy",
      value: bookings.filter((b: Booking) => b.status === "cancelled").length || 0,
      color: "text-destructive",
    },
  ];

  return (
    <AdminLayout
      title="Quản lý Đặt chỗ"
      subtitle="Tất cả đơn đặt tour và trạng thái thanh toán"
      actions={
        <Button variant="outline">
          <Download className="h-4 w-4" /> Xuất Excel
        </Button>
      }
    >
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
          >
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className={cn("font-display text-3xl font-bold mt-2", s.color)}>
              {s.value}
            </div>
          </div>
        ))}
      </section>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth",
                filter === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-primary"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {paymentStatusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setPaymentFilter(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth",
                paymentFilter === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-primary"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Input
          placeholder="Tìm kiếm mã đơn, khách hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-secondary/40">
                <th className="px-6 py-4 font-semibold">Mã</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Tour</th>
                <th className="px-6 py-4 font-semibold">Ngày khởi hành</th>
                <th className="px-6 py-4 font-semibold">Khách</th>
                <th className="px-6 py-4 font-semibold">Số tiền</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Thanh toán</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                bookings.map((booking: Booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-border/50 hover:bg-secondary/20 transition-smooth"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-primary">
                      {booking.booking_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                          {booking.user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {booking.user.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{booking.tour.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(booking.departure_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-foreground">{booking.num_people}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {formatPrice(booking.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setExpandedStatus(
                              expandedStatus === booking.id ? null : booking.id
                            )
                          }
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max",
                            statusStyles[booking.status] || statusStyles.pending
                          )}
                        >
                          {statusLabels[booking.status]}
                          <ChevronDown className="h-3 w-3" />
                        </button>

                        {expandedStatus === booking.id && (
                          <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-max">
                            {["pending", "contacted", "confirmed", "completed", "cancelled"]
                              .filter((s) => s !== booking.status)
                              .map((s) => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    statusMutation.mutate({ id: booking.id, status: s });
                                    setExpandedStatus(null);
                                  }}
                                  disabled={statusMutation.isPending}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
                                >
                                  {statusLabels[s]}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setExpandedPaymentStatus(
                              expandedPaymentStatus === booking.id ? null : booking.id
                            )
                          }
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max",
                            paymentStatusStyles[booking.payment_status] ||
                            paymentStatusStyles.pending
                          )}
                        >
                          {paymentStatusLabels[booking.payment_status]}
                          <ChevronDown className="h-3 w-3" />
                        </button>

                        {expandedPaymentStatus === booking.id && (
                          <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-max">
                            {["pending", "completed", "failed", "refunded"]
                              .filter((s) => s !== booking.payment_status)
                              .map((s) => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    paymentMutation.mutate({ id: booking.id, status: s });
                                    setExpandedPaymentStatus(null);
                                  }}
                                  disabled={paymentMutation.isPending}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
                                >
                                  {paymentStatusLabels[s]}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedBooking(booking);
                        setAdminNotes(booking.admin_notes || "");
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hàng {selectedBooking.booking_code}</DialogTitle>
                <DialogDescription>
                  Phương thức thanh toán: {
                    selectedBooking.payment_method === 'cash' ? 'Tiền mặt tại văn phòng' :
                      selectedBooking.payment_method === 'vnpay' ? 'VNPay' :
                        selectedBooking.payment_method === 'viettel_money' ? 'Viettel Money' : 'Khác'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Khách hàng</h4>
                    <p className="font-medium text-foreground">{selectedBooking.user.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.user.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Tour</h4>
                    <p className="font-medium text-foreground">{selectedBooking.tour.name}</p>
                    <p className="text-sm text-muted-foreground">Khởi hành: {new Date(selectedBooking.departure_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {/* Refund Info Section */}
                {(selectedBooking.status === 'cancelled' && (selectedBooking.payment_status === 'completed' || selectedBooking.payment_status === 'refunded')) && (
                  <div className="mt-6 border-t border-border pt-4">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-warning" /> Thông tin hoàn tiền
                    </h4>
                    <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {selectedBooking.user.bank_name ? (
                        <div className="text-sm">
                          <p><span className="text-muted-foreground">Ngân hàng:</span> <span className="font-medium text-foreground">{selectedBooking.user.bank_name}</span></p>
                          <p><span className="text-muted-foreground">Số tài khoản:</span> <span className="font-medium text-foreground">{selectedBooking.user.bank_account_no}</span></p>
                          <p><span className="text-muted-foreground">Chủ tài khoản:</span> <span className="font-medium text-foreground uppercase">{selectedBooking.user.bank_account_name}</span></p>
                        </div>
                      ) : (
                        <p className="text-sm text-destructive italic">Khách hàng chưa cập nhật thông tin ngân hàng trong hồ sơ.</p>
                      )}
                      
                      {selectedBooking.payment_status === 'completed' && selectedBooking.user.bank_name && (
                        <Button 
                           variant="outline"
                           className="bg-warning hover:bg-warning/90 text-white border-0"
                           onClick={() => {
                             paymentMutation.mutate({ id: selectedBooking.id, status: 'refunded' });
                             setSelectedBooking({...selectedBooking, payment_status: 'refunded'});
                           }}
                           disabled={paymentMutation.isPending}
                        >
                           Xác nhận đã hoàn tiền
                        </Button>
                      )}
                      {selectedBooking.payment_status === 'refunded' && (
                        <div className="px-3 py-1.5 bg-success/20 text-success rounded-md text-sm font-semibold flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4" /> Đã hoàn tiền
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Thông tin hành khách ({selectedBooking.num_people})</h4>
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium">STT</th>
                          <th className="text-left px-4 py-2 font-medium">Họ tên</th>
                          <th className="text-left px-4 py-2 font-medium">CCCD</th>
                          <th className="text-left px-4 py-2 font-medium">SĐT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBooking.travelers?.length > 0 ? (
                          selectedBooking.travelers.map((t: any, i: number) => (
                            <tr key={i} className="border-t border-border/50">
                              <td className="px-4 py-2">{i + 1}</td>
                              <td className="px-4 py-2 font-medium">{t.full_name}</td>
                              <td className="px-4 py-2 text-muted-foreground">{t.id_card}</td>
                              <td className="px-4 py-2 text-muted-foreground">{t.phone}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">Chưa có thông tin hành khách</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> Biên lai thanh toán (Bill)
                  </h4>
                  {selectedBooking.payment_receipt ? (
                    <div className="rounded-xl overflow-hidden border border-border max-w-sm">
                      <img src={getImageUrl(selectedBooking.payment_receipt)!} alt="Bill chuyển khoản" className="w-full h-auto object-contain" />
                    </div>
                  ) : selectedBooking.payment_method === 'cash' ? (
                    <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Ghi chú nghiệp vụ (Liên hệ khách, lịch hẹn)</label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder=""
                          className="min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => notesMutation.mutate({ id: selectedBooking.id, notes: adminNotes })}
                            disabled={notesMutation.isPending}
                          >
                            Lưu ghi chú
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        {selectedBooking.status === 'pending' && (
                          <Button
                            variant="outline"
                            className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                            onClick={() => statusMutation.mutate({ id: selectedBooking.id, status: 'contacted' })}
                            disabled={statusMutation.isPending}
                          >
                            Xác nhận đã liên hệ hẹn khách
                          </Button>
                        )}
                        {selectedBooking.status === 'contacted' && (
                          <span className="text-sm font-medium text-blue-600">✓ Đã xác nhận liên hệ</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary/30 border border-border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                      Khách hàng chưa tải lên biên lai.
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="font-display font-bold text-xl text-primary">{formatPrice(selectedBooking.total_price)}</div>
                  <div className="flex gap-2">
                    {selectedBooking.payment_status !== 'completed' && (
                      <Button
                        variant="hero"
                        onClick={() => {
                          paymentMutation.mutate({ id: selectedBooking.id, status: 'completed' });
                          statusMutation.mutate({ id: selectedBooking.id, status: 'confirmed' });
                        }}
                        disabled={paymentMutation.isPending || statusMutation.isPending}
                      >
                        Xác nhận & Chốt đơn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBookings;
