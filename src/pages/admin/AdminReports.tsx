import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Map, Ticket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ResponsiveContainer, ComposedChart, Bar, Line, Cell, XAxis, YAxis, Tooltip, PieChart, Pie, Legend, CartesianGrid } from "recharts";

const formatVND = (n: any) => {
  const amount = typeof n === "string" ? parseFloat(n) : n;
  if (!amount || isNaN(amount)) return "0đ";
  if (amount >= 1_000_000_000) return `₫${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₫${(amount / 1_000_000).toFixed(0)}M`;
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

const formatVNDCompact = (amount: number) => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${amount}đ`;
};

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10B981", "#F59E0B", "#6B7280"];

const AdminReports = () => {
  // Fetch real stats from dashboard API
  const { data: dashData, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api.get("/admin/dashboard").then((r) => r.data.data),
  });

  const kpis = [
    {
      icon: DollarSign,
      label: "Tổng doanh thu",
      value: dashData ? formatVND(dashData.total_revenue) : "–",
      delta: dashData ? `${dashData.total_bookings} đơn` : "...",
      up: true,
      color: "bg-accent/15 text-accent",
    },
    {
      icon: Ticket,
      label: "Đơn đặt tour",
      value: dashData ? dashData.total_bookings : "–",
      delta: dashData ? `${dashData.pending_bookings} chờ xác nhận` : "...",
      up: (dashData?.pending_bookings ?? 0) === 0,
      color: "bg-secondary text-primary",
    },
    {
      icon: Users,
      label: "Người dùng",
      value: dashData ? dashData.total_users : "–",
      delta: "Tổng thành viên",
      up: true,
      color: "bg-success/15 text-success",
    },
    {
      icon: Map,
      label: "Tour đang hoạt động",
      value: dashData ? dashData.total_tours : "–",
      delta: "Tổng số tour",
      up: true,
      color: "bg-warning/15 text-warning",
    },
  ];

  const monthlyData = dashData?.monthly_bookings?.length > 0
    ? dashData.monthly_bookings.map((item: any) => {
        const parts = item.month.split("-");
        return {
          name: `Th${parts[1]}/${parts[0].slice(-2)}`,
          count: parseInt(item.count || 0),
        };
      })
    : [];

  const hasMonthlyData = monthlyData.length > 0;

  // 2. Process Top Tours Data
  const tourMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
  if (dashData?.recent_bookings) {
    dashData.recent_bookings.forEach((b: any) => {
      const name = b.tour?.name || "Unknown";
      if (!tourMap[name]) tourMap[name] = { name, bookings: 0, revenue: 0 };
      tourMap[name].bookings += 1;
      tourMap[name].revenue += parseFloat(b.total_price || 0);
    });
  }
  const topTours = Object.values(tourMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);
  const maxBookings = Math.max(...topTours.map((t) => t.bookings), 1);

  // 3. Process Payment Channels Data (PieChart compatible)
  let pieData: { name: string; value: number }[] = [];
  if (dashData?.recent_bookings && dashData.recent_bookings.length > 0) {
    const total = dashData.recent_bookings.length;
    const counts: Record<string, number> = {};
    dashData.recent_bookings.forEach((b: any) => {
      const method = b.payment_method || 'Khác';
      counts[method] = (counts[method] || 0) + 1;
    });
    
    pieData = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        let display = name;
        if (name === 'vnpay') display = 'VNPay';
        if (name === 'transfer' || name === 'bank_transfer') display = 'Chuyển khoản';
        if (name === 'cash') display = 'Tiền mặt';
        return {
          name: display,
          value: Math.round((count / total) * 100),
        };
      });
  } else {
    pieData = [
      { name: "Khác", value: 100 }
    ];
  }

  return (
    <AdminLayout
      title="Báo cáo & Phân tích"
      subtitle="Tổng quan hiệu suất kinh doanh thực tế"
      actions={
        <Button variant="outline">
          <Download className="h-4 w-4" /> Tải PDF
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
                <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center mb-4", k.color)}>
                  <k.icon className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground">{k.label}</div>
                <div className="font-display text-2xl font-bold text-foreground mt-1">{k.value}</div>
                <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", k.up ? "text-success" : "text-warning")}>
                  {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {k.delta}
                </div>
              </div>
            ))}
          </section>

          {/* Charts row */}
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Recharts BarChart: bookings by month */}
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-foreground">Đơn đặt theo thời gian</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                  Báo cáo thực tế
                </span>
              </div>
              
              <div className="h-72 mt-4">
                {!hasMonthlyData ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Ticket className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Chưa có đơn đặt tour nào. Biểu đồ sẽ cập nhật khi có dữ liệu thực.</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <filter id="glow-line" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
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
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl text-left">
                              <p className="text-xs text-muted-foreground font-medium mb-1">{payload[0].payload.name}</p>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                  Số đơn: {payload[0].value} đơn
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={28} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: "hsl(var(--accent))", strokeWidth: 2, fill: "hsl(var(--background))" }}
                      activeDot={{ r: 6, stroke: "hsl(var(--accent))", strokeWidth: 2, fill: "hsl(var(--accent))" }}
                      filter="url(#glow-line)"
                    />
                  </ComposedChart>
                 </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recharts PieChart: Payment Channels */}
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col justify-between">
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Kênh thanh toán</h2>
              
              <div className="h-[260px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl text-xs text-left">
                              <p className="font-semibold text-foreground">{payload[0].name}</p>
                              <p className="font-bold text-primary mt-0.5">{payload[0].value}% tổng số</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40} 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-foreground/80 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Top tours */}
          <section className="mt-8 bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-foreground">Top tour theo lượt đặt</h2>
              <span className="text-xs text-muted-foreground font-medium">Báo cáo thực tế</span>
            </div>
            {topTours.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Chưa có đơn đặt tour nào</p>
            ) : (
              <div className="space-y-5">
                {topTours.map((t, i) => (
                  <div key={t.name} className="grid grid-cols-[40px_1fr_120px_130px] items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary text-primary flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground truncate">{t.name}</div>
                      <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(t.bookings / maxBookings) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">{t.bookings} đơn</div>
                    <div className="font-semibold text-foreground text-right">{formatVND(t.revenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
