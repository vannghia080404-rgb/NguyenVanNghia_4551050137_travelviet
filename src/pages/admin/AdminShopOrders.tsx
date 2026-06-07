import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin, User, Search } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AdminShopOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const [trackingForm, setTrackingForm] = useState<any>({ orderId: null, title: "Đã giao", description: "", location: "", image: null });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-shop-orders"],
    queryFn: () => api.get("/admin/shop/orders").then(res => res.data.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => api.put(`/admin/shop/orders/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái đơn hàng");
      queryClient.invalidateQueries({ queryKey: ["admin-shop-orders"] });
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  const addTrackingMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.location) formData.append('location', data.location);
      if (data.image) formData.append('image', data.image);
      return api.post(`/admin/shop/orders/${data.orderId}/trackings`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
    },
    onSuccess: () => {
      toast.success("Đã thêm cập nhật hành trình");
      queryClient.invalidateQueries({ queryKey: ["admin-shop-orders"] });
      setTrackingForm({ orderId: null, title: "Đã giao", description: "", location: "", image: null });
    },
    onError: () => toast.error("Thêm hành trình thất bại"),
  });

  const filteredOrders = orders?.filter((o: any) => 
    o.order_code.toLowerCase().includes(search.toLowerCase()) || 
    o.shipping_name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Chờ xác nhận</Badge>;
      case "preparing": return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><Package className="w-3 h-3 mr-1" /> Đang chuẩn bị</Badge>;
      case "shipping": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Truck className="w-3 h-3 mr-1" /> Đang giao</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành</Badge>;
      case "cancelled": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Đơn Hàng Thời Trang" subtitle="Quản lý quá trình giao nhận đồ du lịch">
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="font-display font-bold text-foreground">Tất cả đơn hàng ({filteredOrders.length})</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm mã đơn, tên khách..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>Không có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mã Đơn / Ngày</th>
                  <th className="px-6 py-4 font-semibold">Khách Hàng</th>
                  <th className="px-6 py-4 font-semibold">Tổng Tiền</th>
                  <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{order.order_code}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString("vi-VN")}</div>
                      <div className="text-xs bg-secondary inline-block px-2 py-0.5 rounded mt-1">{order.paymentMethod?.name || 'COD'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-medium text-foreground">{order.shipping_name}</div>
                      <div className="text-muted-foreground text-xs">{order.shipping_phone}</div>
                      <div className="text-xs text-muted-foreground truncate mt-1" title={order.shipping_address}>
                        {order.shipping_address}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {new Intl.NumberFormat("vi-VN").format(order.total_price)}đ
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-primary hover:underline text-xs font-semibold bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                            Xem & Cập nhật
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-card border-border rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                              <Package className="h-5 w-5 text-primary" />
                              Chi tiết đơn hàng: {order.order_code}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="grid md:grid-cols-2 gap-6 mt-4">
                            {/* Thông tin KH */}
                            <div className="bg-secondary/30 p-4 rounded-xl border border-border">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 border-b border-border pb-2"><User className="h-4 w-4" /> Giao đến</h4>
                              <div className="text-sm space-y-2 text-muted-foreground flex-1">
                                <p><strong className="text-foreground">Người nhận:</strong> {order.shipping_name}</p>
                                <p><strong className="text-foreground">SĐT:</strong> {order.shipping_phone}</p>
                                <p className="flex items-start gap-1">
                                  <strong className="text-foreground shrink-0 mt-0.5"><MapPin className="h-3.5 w-3.5" /></strong>
                                  {order.shipping_address}
                                </p>
                                {order.notes && <p><strong className="text-foreground">Ghi chú:</strong> {order.notes}</p>}
                                {order.shipping_lat && order.shipping_lng && (
                                  <div className="mt-3 h-32 w-full rounded-xl overflow-hidden border border-border/50 relative z-0">
                                    <MapContainer center={[order.shipping_lat, order.shipping_lng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                      <Marker position={[order.shipping_lat, order.shipping_lng]}>
                                        <Popup>Vị trí khách chọn</Popup>
                                      </Marker>
                                    </MapContainer>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cập nhật trạng thái */}
                            <div className="bg-secondary/30 p-4 rounded-xl border border-border flex flex-col justify-between">
                              <div>
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 border-b border-border pb-2">Cập nhật trạng thái</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'pending' })} className={`p-2 text-xs rounded-lg border ${order.status === 'pending' ? 'bg-yellow-100 border-yellow-300 text-yellow-800 font-bold' : 'bg-background hover:bg-secondary'}`}>Chờ xác nhận</button>
                                  <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'preparing' })} className={`p-2 text-xs rounded-lg border ${order.status === 'preparing' ? 'bg-orange-100 border-orange-300 text-orange-800 font-bold' : 'bg-background hover:bg-secondary'}`}>Đang chuẩn bị</button>
                                  <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'shipping' })} className={`p-2 text-xs rounded-lg border ${order.status === 'shipping' ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' : 'bg-background hover:bg-secondary'}`}>Đang giao hàng</button>
                                  <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'completed' })} className={`p-2 text-xs rounded-lg border ${order.status === 'completed' ? 'bg-green-100 border-green-300 text-green-800 font-bold' : 'bg-background hover:bg-secondary'}`}>Hoàn thành</button>
                                  <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'cancelled' })} className={`p-2 text-xs rounded-lg border ${order.status === 'cancelled' ? 'bg-red-100 border-red-300 text-red-800 font-bold' : 'bg-background hover:bg-secondary'}`}>Hủy đơn</button>
                                </div>
                              </div>
                              {order.payment_receipt && (
                                <div className="mt-4 border-t border-border pt-4">
                                  <h4 className="font-semibold text-sm mb-2">Biên lai thanh toán</h4>
                                  <a href={order.payment_receipt} target="_blank" rel="noreferrer" className="block border rounded-xl overflow-hidden hover:opacity-80 transition-opacity max-w-[200px]">
                                    <img src={order.payment_receipt} alt="Receipt" className="w-full h-auto object-contain" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Cập nhật hành trình */}
                            <div className="bg-secondary/30 p-4 rounded-xl border border-border md:col-span-2">
                              <h4 className="font-semibold text-sm mb-3 border-b border-border pb-2">Thêm thông tin theo dõi</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Input placeholder="Tiêu đề (VD: Đã đến bưu cục...)" value={trackingForm.title} onChange={e => setTrackingForm({ ...trackingForm, title: e.target.value, orderId: order.id })} />
                                  <Input placeholder="Mô tả thêm (Tùy chọn)" value={trackingForm.description} onChange={e => setTrackingForm({ ...trackingForm, description: e.target.value, orderId: order.id })} />
                                  <Input placeholder="Vị trí (Tùy chọn)" value={trackingForm.location} onChange={e => setTrackingForm({ ...trackingForm, location: e.target.value, orderId: order.id })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Input type="file" accept="image/*" onChange={e => setTrackingForm({ ...trackingForm, image: e.target.files?.[0], orderId: order.id })} />
                                  <button disabled={!trackingForm.title || addTrackingMutation.isPending || trackingForm.orderId !== order.id} onClick={() => addTrackingMutation.mutate(trackingForm)} className="bg-primary text-primary-foreground font-semibold h-10 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                    {addTrackingMutation.isPending ? "Đang thêm..." : "Thêm hành trình"}
                                  </button>
                                </div>
                              </div>

                              {order.trackings?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border space-y-3">
                                  <h5 className="font-medium text-sm">Hành trình đơn hàng</h5>
                                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                    {order.trackings.map((t: any, idx: number) => (
                                      <div key={t.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                          <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-3 rounded border border-border shadow-sm">
                                          <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-slate-900">{t.title}</div>
                                            <time className="font-caveat font-medium text-indigo-500 text-xs">{new Date(t.created_at).toLocaleString('vi-VN')}</time>
                                          </div>
                                          {t.description && <div className="text-slate-500 text-sm">{t.description}</div>}
                                          {t.location && <div className="text-slate-500 text-xs mt-1"><MapPin className="w-3 h-3 inline mr-1"/>{t.location}</div>}
                                          {t.image_url && <img src={t.image_url} alt="tracking" className="mt-2 rounded-lg max-h-32 object-contain border" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Danh sách SP */}
                          <div className="mt-6 border border-border rounded-xl overflow-hidden">
                            <div className="bg-secondary/50 px-4 py-2 font-semibold text-sm border-b border-border">Sản phẩm đã mua</div>
                            <div className="p-4 max-h-60 overflow-y-auto space-y-3">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-3 items-center">
                                  <div className="h-12 w-12 bg-secondary/50 rounded-lg overflow-hidden border border-border/50 shrink-0">
                                    {item.variant?.product?.image_url && <img src={getImageUrl(item.variant.product.image_url)} alt="sp" className="h-full w-full object-cover" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{item.variant?.product?.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.variant?.size} - {item.variant?.color}</p>
                                  </div>
                                  <div className="text-sm font-semibold shrink-0">
                                    {new Intl.NumberFormat("vi-VN").format(item.unit_price)}đ x{item.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="bg-secondary/30 p-4 border-t border-border flex justify-between items-center">
                              <span className="font-semibold">Tổng cộng:</span>
                              <span className="text-xl font-bold text-primary">{new Intl.NumberFormat("vi-VN").format(order.total_price)}đ</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
