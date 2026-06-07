import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Clock, Truck, CheckCircle2, XCircle, Eye, Search, ExternalLink, Upload, Loader2, MapPin } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import ProfileLayout from "@/components/layout/ProfileLayout";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProfileShopOrders() {
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["shop-orders"],
    queryFn: () => api.get("/shop/orders").then(res => res.data.data),
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async (data: { orderId: number; file: File }) => {
      const formData = new FormData();
      formData.append('receipt', data.file);
      return api.post(`/shop/orders/${data.orderId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onMutate: (variables) => setUploadingId(variables.orderId),
    onSettled: () => setUploadingId(null),
    onSuccess: () => {
      toast.success("Đã tải lên biên lai thanh toán thành công! Chúng tôi sẽ kiểm tra và xác nhận sớm.");
      queryClient.invalidateQueries({ queryKey: ["shop-orders"] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi tải lên biên lai."),
  });

  const handleFileUpload = (orderId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Vui lòng chọn ảnh dưới 5MB");
        return;
      }
      uploadReceiptMutation.mutate({ orderId, file });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Chờ xác nhận</Badge>;
      case "preparing": return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Đang chuẩn bị</Badge>;
      case "shipping": return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Đang giao hàng</Badge>;
      case "completed": return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Hoàn thành</Badge>;
      case "cancelled": return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Đã hủy</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ProfileLayout title="Đơn mua sắm">
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Lịch sử mua sắm thời trang
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10"><div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Bạn chưa có đơn mua sắm nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-secondary/40 p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      Mã đơn: <span className="text-primary">{order.order_code}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ngày đặt: {new Date(order.created_at).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit'})}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-lg font-bold text-primary">{new Intl.NumberFormat("vi-VN").format(order.total_price)}đ</span>
                  </div>
                </div>
                
                <div className="p-4 bg-card space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <div className="h-16 w-16 bg-secondary/30 rounded-xl overflow-hidden shrink-0 border border-border/50 flex items-center justify-center">
                        {item.variant?.product?.image_url && <img src={getImageUrl(item.variant.product.image_url)} alt={item.variant.product.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-1">{item.variant?.product?.name || 'Sản phẩm đã bị xóa'}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.variant?.size} - {item.variant?.color}</div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">
                        {new Intl.NumberFormat("vi-VN").format(item.unit_price)}đ x{item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/20 p-4 border-t border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Truck className="h-4 w-4" /> 
                      {order.delivery_method === 'office_pickup' ? 'Nhận tại văn phòng' : 'Giao hàng tận nơi'}
                    </p>
                    {order.delivery_method === 'home_delivery' && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> 
                        {order.shipping_address}
                      </p>
                    )}
                  </div>

                  <div className="text-right w-full md:w-auto">
                    <div className="text-xs text-muted-foreground mb-1">
                      Tổng tiền hàng: {new Intl.NumberFormat("vi-VN").format(order.total_price)}đ <br/>
                      Giảm giá: -{new Intl.NumberFormat("vi-VN").format(order.discount_amount || 0)}đ <br/>
                      Phí vận chuyển: {order.shipping_fee == 0 ? 'Miễn phí' : `${new Intl.NumberFormat("vi-VN").format(order.shipping_fee)}đ`}
                    </div>
                    <div className="font-bold text-primary text-lg border-t border-border/50 pt-1 mt-1">
                      Thành tiền: {new Intl.NumberFormat("vi-VN").format(parseFloat(order.total_price) - parseFloat(order.discount_amount || 0) + parseFloat(order.shipping_fee))}đ
                    </div>
                  </div>
                </div>

                {order.trackings?.length > 0 && (
                  <div className="bg-background p-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-4">Theo dõi kiện hàng</h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {order.trackings.map((t: any, idx: number) => (
                        <div key={t.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-slate-500'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-3 rounded-lg border border-border shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className={`font-bold ${idx === 0 ? 'text-primary' : 'text-slate-700'}`}>{t.title}</div>
                              <time className="font-medium text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString('vi-VN')}</time>
                            </div>
                            {t.description && <div className="text-slate-600 text-sm mt-1">{t.description}</div>}
                            {t.location && <div className="text-slate-500 text-xs mt-2"><MapPin className="w-3 h-3 inline mr-1"/>{t.location}</div>}
                            {t.image_url && <img src={t.image_url} alt="tracking" className="mt-3 rounded-lg max-h-40 object-contain border" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.paymentMethod?.type !== 'cash' && order.status === 'pending' && (
                  <div className="bg-primary/5 p-4 border-t border-border flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm text-foreground">Bạn đã chọn thanh toán qua: {order.paymentMethod?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.payment_receipt 
                          ? "Biên lai của bạn đang được duyệt." 
                          : "Vui lòng thanh toán và tải lên biên lai để chúng tôi xác nhận đơn hàng."}
                      </p>
                    </div>
                    {order.payment_receipt ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Đã tải lên</Badge>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id={`receipt-upload-${order.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(order.id, e)}
                          disabled={uploadingId === order.id}
                        />
                        <label htmlFor={`receipt-upload-${order.id}`}>
                          <Button variant="hero" size="sm" className="cursor-pointer" asChild disabled={uploadingId === order.id}>
                            <span>
                              {uploadingId === order.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                              Tải biên lai
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
