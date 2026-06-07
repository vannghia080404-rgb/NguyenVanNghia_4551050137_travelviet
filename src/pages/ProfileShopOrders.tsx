import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Truck, CheckCircle2, XCircle, Search, Upload, Loader2, MapPin, Store, Receipt } from "lucide-react";
import { getImageUrl, cn } from "@/lib/utils";
import ProfileLayout from "@/components/layout/ProfileLayout";
import api, { shopOrderAPIs } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unpaid', label: 'Chờ thanh toán' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'shipping', label: 'Đang giao hàng' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' }
];

export default function ProfileShopOrders() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [cancelModal, setCancelModal] = useState<{ show: boolean; orderId: number | null; reason: string }>({ show: false, orderId: null, reason: '' });
  const [viewReasonModal, setViewReasonModal] = useState<{ show: boolean; reason: string }>({ show: false, reason: '' });

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
      toast.success("Đã tải lên biên lai thanh toán thành công!");
      queryClient.invalidateQueries({ queryKey: ["shop-orders"] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi tải lên biên lai."),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, id, cancelReason }: { action: 'pay' | 'cancel' | 'confirm', id: number, cancelReason?: string }) => {
      if (action === 'pay') return shopOrderAPIs.pay(id);
      if (action === 'cancel') return shopOrderAPIs.cancel(id, cancelReason || 'Khách hàng đã hủy đơn');
      if (action === 'confirm') return shopOrderAPIs.confirmReceived(id);
    },
    onMutate: (variables) => setProcessingId(variables.id),
    onSettled: () => setProcessingId(null),
    onSuccess: (res, variables) => {
      if (variables.action === 'pay') {
        if (res?.data?.payment_url) {
          window.location.href = res.data.payment_url;
        }
      } else if (variables.action === 'cancel') {
        toast.success("Đã hủy đơn hàng thành công!");
      } else if (variables.action === 'confirm') {
        toast.success("Cảm ơn bạn đã xác nhận nhận hàng!");
      }
      queryClient.invalidateQueries({ queryKey: ["shop-orders"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
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

  const filteredOrders = Array.isArray(orders) ? orders.filter((order: any) => {
    if (activeTab === 'all') return true;
    
    const isCash = order.paymentMethod?.type === 'cash' || order.payment_method === 'cash';
    const isUnpaid = order.payment_status === 'unpaid';
    
    if (activeTab === 'unpaid') return order.status === 'pending' && isUnpaid && !isCash && !order.payment_receipt;
    if (activeTab === 'pending') return (order.status === 'pending' || order.status === 'processing' || order.status === 'confirmed') && (!isUnpaid || isCash || order.payment_receipt);
    if (activeTab === 'shipping') return order.status === 'shipping';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    
    return true;
  }) : [];

  const getStatusText = (order: any) => {
    if (order.status === 'cancelled') return { text: 'ĐÃ HỦY', color: 'text-red-500' };
    if (order.status === 'completed') return { text: 'HOÀN THÀNH', color: 'text-green-600' };
    if (order.status === 'shipping') return { text: 'ĐANG GIAO HÀNG', color: 'text-blue-600' };
    if (order.status === 'pending' || order.status === 'processing' || order.status === 'confirmed') {
      const isCash = order.paymentMethod?.type === 'cash' || order.payment_method === 'cash';
      if (!isCash && order.payment_status === 'unpaid' && !order.payment_receipt) {
        return { text: 'CHỜ THANH TOÁN', color: 'text-orange-500' };
      }
      return { text: 'CHỜ XÁC NHẬN', color: 'text-yellow-600' };
    }
    return { text: order.status.toUpperCase(), color: 'text-slate-500' };
  };

  return (
    <ProfileLayout title="Đơn mua sắm">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Shopee-style Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6 bg-[#f5f5f5] min-h-[500px]">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="bg-white text-center py-20 text-muted-foreground rounded-xl shadow-sm border border-slate-100">
              <Receipt className="h-16 w-16 mx-auto mb-4 opacity-20 text-slate-400" />
              <p className="text-lg font-medium text-slate-600">Chưa có đơn hàng</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order: any) => {
                const statusInfo = getStatusText(order);
                const paymentType = order.paymentMethod?.type || order.payment_method;
                const isTransfer = paymentType !== 'cash' && paymentType !== 'vnpay' && paymentType !== 'e_wallet';
                
                return (
                  <div key={order.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <Store className="h-4 w-4 text-primary" /> <span className="hidden sm:inline">TravelViet Shop</span>
                        <span className="text-xs font-normal text-muted-foreground sm:ml-2">Mã đơn: <span className="font-medium text-foreground">{order.order_code}</span></span>
                      </div>
                      <div className={cn("text-sm font-bold flex items-center gap-1.5", statusInfo.color)}>
                        {statusInfo.text}
                      </div>
                    </div>
                    
                    {/* Body - Items */}
                    <div className="px-4 py-3 bg-white">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-4 py-3 border-b border-slate-50 last:border-0">
                          <div className="h-20 w-20 bg-secondary/30 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                            {item.variant?.product?.image_url && <img src={getImageUrl(item.variant.product.image_url)} alt={item.variant.product.name} className="h-full w-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="font-medium text-base line-clamp-2 leading-tight">{item.variant?.product?.name || 'Sản phẩm đã bị xóa'}</div>
                              <div className="text-sm text-muted-foreground mt-1">Phân loại: {item.variant?.size} - {item.variant?.color}</div>
                            </div>
                            <div className="text-sm font-medium">x{item.quantity}</div>
                          </div>
                          <div className="text-sm font-medium self-center text-primary whitespace-nowrap">
                            {new Intl.NumberFormat("vi-VN").format(item.unit_price)}đ
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 bg-white/50">
                      <hr className="border-slate-100" />
                    </div>

                    {/* Footer - Total & Actions */}
                    <div className="p-4 bg-white">
                      <div className="flex justify-end items-center gap-2 mb-4">
                        <span className="text-sm text-muted-foreground">Thành tiền:</span>
                        <span className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat("vi-VN").format(parseFloat(order.total_price) - parseFloat(order.discount_amount || 0) + parseFloat(order.shipping_fee))}đ
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap justify-end gap-3 mt-4">
                        {/* UNPAID ACTIONS */}
                        {statusInfo.text === 'CHỜ THANH TOÁN' && (
                          <>
                            <Button variant="outline" className="h-10 px-6 text-sm hover:bg-slate-50"
                                    onClick={() => setCancelModal({ show: true, orderId: order.id, reason: '' })}
                                    disabled={processingId === order.id}>
                              Hủy đơn hàng
                            </Button>
                            
                            {isTransfer && !order.payment_receipt && (
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
                                  <Button variant="outline" className="h-10 px-6 cursor-pointer text-sm hover:bg-slate-50 border-slate-200" asChild disabled={uploadingId === order.id}>
                                    <span>{uploadingId === order.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />} Tải biên lai</span>
                                  </Button>
                                </label>
                              </div>
                            )}

                            <Button variant="hero" className="h-10 px-8 font-semibold shadow-sm text-sm"
                                    onClick={() => {
                                      if (paymentType === 'vnpay') {
                                        actionMutation.mutate({ action: 'pay', id: order.id });
                                      } else {
                                        navigate(`/payment/transfer/${order.order_code}?amount=${parseFloat(order.total_price) - parseFloat(order.discount_amount || 0) + parseFloat(order.shipping_fee)}&method=${order.paymentMethod?.id || ''}`);
                                      }
                                    }}
                                    disabled={processingId === order.id}>
                              {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Thanh toán ngay
                            </Button>
                          </>
                        )}

                        {/* PENDING ACTIONS (PAID/CASH) */}
                        {statusInfo.text === 'CHỜ XÁC NHẬN' && (
                          <>
                            <Button variant="outline" className="h-10 px-6 text-sm hover:bg-slate-50"
                                    onClick={() => setCancelModal({ show: true, orderId: order.id, reason: '' })}
                                    disabled={processingId === order.id}>
                              Hủy đơn hàng
                            </Button>
                            
                            {isTransfer && order.payment_receipt && (
                              <Button variant="outline" className="h-10 px-6 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 text-sm"
                                      onClick={() => navigate(`/payment/transfer/${order.order_code}?amount=${parseFloat(order.total_price) - parseFloat(order.discount_amount || 0) + parseFloat(order.shipping_fee)}&method=${order.paymentMethod?.id || ''}`)}>
                                Xem Biên Lai
                              </Button>
                            )}
                            
                            <Button variant="outline" className="h-10 px-6 text-sm hover:bg-slate-50">Liên hệ người bán</Button>
                          </>
                        )}

                        {/* SHIPPING ACTIONS */}
                        {statusInfo.text === 'ĐANG GIAO HÀNG' && (
                          <>
                            <Button variant="hero" className="h-10 px-8 font-semibold shadow-sm text-sm"
                                    onClick={() => {
                                      if (confirm('Chỉ xác nhận khi bạn đã nhận và kiểm tra hàng. Tiền sẽ được chuyển cho người bán.')) {
                                        actionMutation.mutate({ action: 'confirm', id: order.id });
                                      }
                                    }}
                                    disabled={processingId === order.id}>
                              {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Đã nhận được hàng
                            </Button>
                          </>
                        )}

                        {/* COMPLETED ACTIONS */}
                        {statusInfo.text === 'HOÀN THÀNH' && (
                          <>
                            <Button variant="outline" className="h-10 px-6 border-primary text-primary hover:bg-primary/5 text-sm">Mua lại</Button>
                            <Button variant="hero" className="h-10 px-8 font-semibold shadow-sm text-sm">Đánh giá sản phẩm</Button>
                          </>
                        )}

                        {/* CANCELLED ACTIONS */}
                        {statusInfo.text === 'ĐÃ HỦY' && (
                          <>
                            <Button variant="outline" className="h-10 px-6 text-sm hover:bg-slate-50"
                                            onClick={() => setViewReasonModal({ show: true, reason: order.cancel_reason || 'Không có lý do' })}>
                              Xem chi tiết hủy
                            </Button>
                            <Button variant="hero" className="h-10 px-6 font-semibold shadow-sm text-sm">Mua lại</Button>
                          </>
                        )}
                      </div>
                      
                      {/* Tracking Info if Shipping */}
                      {statusInfo.text === 'ĐANG GIAO HÀNG' && order.trackings?.length > 0 && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h4 className="font-semibold text-sm mb-4 flex items-center gap-2 text-slate-700">
                            <Truck className="h-4 w-4" /> Lộ trình giao hàng
                          </h4>
                          <div className="relative pl-6 space-y-5 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-[calc(100%-1rem)] before:w-0.5 before:bg-slate-200">
                            {order.trackings.map((t: any, idx: number) => (
                              <div key={t.id} className="relative">
                                <div className={cn("absolute -left-[1.6rem] w-3.5 h-3.5 rounded-full border-[3px] border-white top-1 shadow-sm", idx === 0 ? "bg-primary" : "bg-slate-300")} />
                                <div className={cn("text-sm leading-tight", idx === 0 ? "font-medium text-slate-800" : "text-slate-500")}>{t.title}</div>
                                <div className="text-xs text-slate-400 mt-1">{new Date(t.created_at).toLocaleString('vi-VN')}</div>
                                {t.description && <div className="text-xs text-slate-500 mt-1 bg-white p-2 rounded border border-slate-100 inline-block">{t.description}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Reason Modal */}
      <Dialog open={cancelModal.show} onOpenChange={(open) => !open && setCancelModal({ show: false, orderId: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do hủy đơn hàng</DialogTitle>
            <DialogDescription>Vui lòng chọn hoặc nhập lý do hủy đơn. Thao tác này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              {['Muốn thay đổi địa chỉ giao hàng', 'Muốn đổi sản phẩm khác', 'Tìm thấy giá rẻ hơn ở nơi khác', 'Đổi ý, không muốn mua nữa'].map(r => (
                <Button key={r} variant={cancelModal.reason === r ? "default" : "outline"} className="justify-start text-left font-normal" onClick={() => setCancelModal({ ...cancelModal, reason: r })}>
                  {r}
                </Button>
              ))}
            </div>
            <Input 
              placeholder="Hoặc nhập lý do khác..." 
              value={cancelModal.reason} 
              onChange={e => setCancelModal({ ...cancelModal, reason: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal({ show: false, orderId: null, reason: '' })}>Đóng</Button>
            <Button variant="destructive" 
                    disabled={!cancelModal.reason.trim() || processingId === cancelModal.orderId}
                    onClick={() => {
                      if (cancelModal.orderId) {
                        actionMutation.mutate({ action: 'cancel', id: cancelModal.orderId, cancelReason: cancelModal.reason });
                        setCancelModal({ show: false, orderId: null, reason: '' });
                      }
                    }}>
              {processingId === cancelModal.orderId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Cancel Reason Modal */}
      <Dialog open={viewReasonModal.show} onOpenChange={(open) => !open && setViewReasonModal({ show: false, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết hủy đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-slate-700">Lý do hủy:</p>
            <p className="text-base mt-1 p-3 bg-slate-50 rounded-md border border-slate-100">{viewReasonModal.reason}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReasonModal({ show: false, reason: '' })}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProfileLayout>
  );
}
