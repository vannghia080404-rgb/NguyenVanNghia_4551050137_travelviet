import { useQuery } from "@tanstack/react-query";
import { Package, Clock, Truck, CheckCircle2, XCircle, Eye, Search, ExternalLink } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import ProfileLayout from "@/components/layout/ProfileLayout";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function ProfileShopOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["shop-orders"],
    queryFn: () => api.get("/shop/orders").then(res => res.data.data),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Chờ xác nhận</Badge>;
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
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
