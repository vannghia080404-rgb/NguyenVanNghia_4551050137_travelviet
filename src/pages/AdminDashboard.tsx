import { Link } from "react-router-dom";
import { Ticket, Users, Map, DollarSign, MoreVertical, ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-halong1111.jpg";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatVND = (n: any) => {
  const amount = typeof n === "string" ? parseFloat(n) : n;
  if (!amount || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

const formatVNDCompact = (amount: number) => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${amount}đ`;
};

const statusStyles: Record<string, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  completed: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

const AdminDashboard = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    }
  });

  const dashboardData = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Real stats mapping
  const apiStats = [
    { icon: Map, label: "Tổng số tour", value: dashboardData?.total_tours || 0, change: "Đang hiển thị công khai", color: "bg-secondary text-primary" },
    { icon: Ticket, label: "Đơn đặt chỗ", value: dashboardData?.total_bookings || 0, change: `${dashboardData?.pending_bookings || 0} đơn cần xử lý`, color: "bg-accent/15 text-accent" },
    { icon: DollarSign, label: "Doanh thu", value: formatVND(dashboardData?.total_revenue), change: "Chỉ tính đơn đã thanh toán", color: "bg-success/15 text-success" },
    { icon: Users, label: "Tổng người dùng", value: dashboardData?.total_users || 0, change: "Tài khoản khách hàng", color: "bg-secondary text-primary" },
  ];

  const apiBookings = dashboardData?.recent_bookings?.slice(0, 5) || [];

  const chartData = dashboardData?.monthly_revenue?.length > 0
    ? dashboardData.monthly_revenue.map((item: any) => ({
        name: `Th${item.month}/${item.year.toString().slice(-2)}`,
        revenue: parseFloat(item.total || 0),
      }))
    : [];

  const hasRevenueData = chartData.length > 0;

  // Find top selling tour from recent bookings dynamically
  let topSellingTour: { tour: any; count: number; revenue: number } | null = null;
  if (dashboardData?.recent_bookings && dashboardData.recent_bookings.length > 0) {
    const tourCounts: Record<number, { tour: any; count: number; revenue: number }> = {};
    dashboardData.recent_bookings.forEach((b: any) => {
      if (b.tour) {
        const id = b.tour.id;
        if (!tourCounts[id]) {
          tourCounts[id] = { tour: b.tour, count: 0, revenue: 0 };
        }
        tourCounts[id].count += 1;
        tourCounts[id].revenue += parseFloat(b.total_price || 0);
      }
    });

    const sortedTours = Object.values(tourCounts).sort((a, b) => b.count - a.count);
    if (sortedTours.length > 0) {
      topSellingTour = sortedTours[0];
    }
  }

  const getTourImage = (url: string | undefined) => {
    if (!url) return heroImage;
    return url.startsWith('http') ? url : `http://localhost:8000${url}`;
  };

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Quản lý hiệu suất kinh doanh và đặt chỗ.">

      {/* Stats */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {apiStats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center mb-4", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="font-display text-3xl font-bold text-foreground mt-1">{s.value}</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" /> {s.change}
              </div>
            </div>
          ))}
      </section>

      {/* Chart + Highlight */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Recharts Area Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-foreground">Doanh thu hàng tháng</h2>
              <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">Báo cáo thực</span>
            </div>

            <div className="h-72 mt-6">
                {!hasRevenueData ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <DollarSign className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Chưa có dữ liệu doanh thu. Dữ liệu sẽ hiển thị khi có đơn đặt thành công.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        {/* Glowing effect filter */}
                        <filter id="glow-revenue" x="-10%" y="-10%" width="120%" height="120%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        {/* Gold/Emerald luxury gradient fill */}
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatVNDCompact(val)}
                        dx={-5}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl text-left">
                                <p className="text-xs text-muted-foreground font-medium mb-1">{payload[0].payload.name}</p>
                                <p className="text-sm font-bold text-primary">{formatVND(payload[0].value)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        filter="url(#glow-revenue)"
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
            </div>
          </div>

          {/* Highlight card */}
          <div className="rounded-2xl overflow-hidden shadow-card relative min-h-[320px] flex flex-col justify-end">
            <img 
              src={getTourImage(topSellingTour?.tour?.image_url)} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/20" />
            <div className="relative p-6 text-primary-foreground">
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-3">
                Bán chạy nhất
              </span>
              <h3 className="font-display text-2xl font-bold line-clamp-2">
                {topSellingTour ? topSellingTour.tour.name : "Du thuyền Hạ Long"}
              </h3>
              <p className="mt-2 text-sm text-primary-foreground/85 line-clamp-3">
                {topSellingTour 
                  ? `Tour được quan tâm và lựa chọn nhiều nhất với ${topSellingTour.count} lượt đặt thành công.` 
                  : "Tour có lượt đặt cao nhất tháng với 450+ chỗ đã được xác nhận."
                }
              </p>
              <div className="mt-5 pt-4 border-t border-primary-foreground/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-primary-foreground/70">Tổng Doanh thu</div>
                  <div className="font-display text-xl font-bold">
                    {topSellingTour ? formatVND(topSellingTour.revenue) : "₫84,200,000"}
                  </div>
                </div>
                <Link 
                  to={topSellingTour ? `/tours/${topSellingTour.tour.slug || topSellingTour.tour.id}` : "#"}
                  target="_blank"
                  className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:scale-105 transition-smooth"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
      </section>

      {/* Recent bookings */}
      <section className="mt-8 bg-card rounded-2xl p-6 shadow-soft border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-foreground">Đơn đặt gần đây</h2>
            <Link to="/admin/bookings" className="text-sm font-medium text-primary hover:underline">Xem tất cả</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-3 font-semibold">Khách hàng</th>
                  <th className="pb-3 font-semibold">Tên tour</th>
                  <th className="pb-3 font-semibold">Ngày</th>
                  <th className="pb-3 font-semibold">Số tiền</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {apiBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">Chưa có đơn đặt tour nào.</td>
                  </tr>
                ) : (
                  apiBookings.map((b: any) => (
                    <tr key={b.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-smooth">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary uppercase">
                            {b.user?.name ? b.user.name.substring(0, 2) : "KH"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{b.user?.name || "Ẩn danh"}</div>
                            <div className="text-xs text-muted-foreground">{b.user?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-foreground">{b.tour?.name || "Tour không tồn tại"}</td>
                      <td className="py-4 text-muted-foreground">{new Date(b.created_at).toLocaleDateString("vi-VN")}</td>
                      <td className="py-4 font-semibold text-foreground">{formatVND(b.total_price)}</td>
                      <td className="py-4">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold capitalize", statusStyles[b.status] || "bg-secondary text-foreground")}>
                          {b.status === 'confirmed' ? 'Đã duyệt' : b.status === 'pending' ? 'Chờ duyệt' : b.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link to="/admin/bookings" className="w-full">Quản lý đơn này</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
