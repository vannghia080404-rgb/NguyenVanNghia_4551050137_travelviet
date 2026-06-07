import { Link, NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Ticket, Calendar, MessageSquare, Users, 
  BarChart3, Bell, Search, Shield, MapPin, LogOut, ExternalLink, Home, Settings, Megaphone, UserSquare2, Building2, Package, ShoppingBag, CreditCard
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { GlobalSettings } from "@/components/layout/GlobalSettings";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";
import { Menu } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/tours", icon: Ticket, label: "Quản lý Tour" },
  { to: "/admin/destinations", icon: MapPin, label: "Quản lý địa danh" },
  { to: "/admin/shop/products", icon: Package, label: "Sản phẩm Shop" },
  { to: "/admin/shop/orders", icon: ShoppingBag, label: "Đơn hàng Shop" },
  { to: "/admin/shop/reviews", icon: MessageSquare, label: "Đánh giá Shop" },
  { to: "/admin/categories", icon: LayoutDashboard, label: "Danh mục tour" },
  { to: "/admin/hotels", icon: Building2, label: "Khách sạn" },
  { to: "/admin/bookings", icon: Calendar, label: "Đơn đặt chỗ" },
  { to: "/admin/reviews", icon: MessageSquare, label: "Đánh giá" },
  { to: "/admin/users", icon: Users, label: "Người dùng" },
  { to: "/admin/ranks", icon: Shield, label: "Hạng thành viên" },
  { to: "/admin/promotions", icon: Ticket, label: "Khuyến mãi" },
  { to: "/admin/vouchers", icon: Ticket, label: "Mã giảm giá" },
  { to: "/admin/reports", icon: BarChart3, label: "Báo cáo" },
  { to: "/admin/broadcast", icon: Megaphone, label: "Gửi thông báo" },
  { to: "/admin/team", icon: UserSquare2, label: "Quản lý đội ngũ" },
  { to: "/admin/payment-methods", icon: CreditCard, label: "Thanh toán" },
  { to: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const SidebarContent = ({ handleLogout, user, onNavigate }: { handleLogout: () => void, user: any, onNavigate?: () => void }) => (
  <>
    <div className="p-6">
      <Link to="/" onClick={onNavigate} className="font-display text-2xl font-bold">TravelViet</Link>
    </div>
    
    <nav className="px-4 flex-1 space-y-1 overflow-y-auto pb-4 scrollbar-hide">
      <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-bold mb-4 px-4">Menu quản trị</div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth",
              isActive
                ? "bg-sidebar-accent text-sidebar-foreground shadow-soft"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}

      <div className="pt-8 pb-4">
        <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-bold mb-4 px-4">Hệ thống</div>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-smooth"
        >
          <Home className="h-4 w-4" />
          Xem trang web
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-smooth"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </nav>

    <div className="p-4">
      <Link to="/admin/profile" onClick={onNavigate} className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/40 border border-white/5 hover:bg-sidebar-accent transition-smooth cursor-pointer">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
          {user?.avatar ? (
            <img src={getImageUrl(user.avatar)} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <Shield className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate hover:text-primary transition-colors">{user?.name || "Admin User"}</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{user?.role === "admin" ? "Quản trị viên" : "Super Admin"}</div>
        </div>
      </Link>
    </div>
  </>
);

const AdminLayout = ({ title, subtitle, children, actions }: Props) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent handleLogout={handleLogout} user={user} />
      </aside>

      <main className="flex-1 lg:ml-64 p-6 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-sidebar text-sidebar-foreground border-none">
                <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
                <SheetDescription className="sr-only">Menu điều hướng dành cho thiết bị di động</SheetDescription>
                <div className="flex flex-col h-full pt-6">
                  <SidebarContent handleLogout={handleLogout} user={user} onNavigate={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{title}</h1>
              {subtitle && <p className="mt-1 text-sm md:text-base text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm..." className="pl-9 w-40 sm:w-56 bg-card" />
            </div>
            <GlobalSettings />
            <button className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary relative shrink-0">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
