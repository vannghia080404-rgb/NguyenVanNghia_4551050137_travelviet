import { Link, useLocation } from "react-router-dom";
import { User, Lock, Bell, ShoppingBag, ChevronRight, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

function getMemberTier(totalSpent: number = 0) {
  if (totalSpent >= 100_000_000) return { label: "Kim Cương 💎", color: "bg-cyan-100 text-cyan-700 border-cyan-200" };
  if (totalSpent >= 50_000_000)  return { label: "Vàng 🥇", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  if (totalSpent >= 10_000_000)  return { label: "Bạc 🥈", color: "bg-gray-100 text-gray-700 border-gray-200" };
  return { label: "Thành viên", color: "bg-green-50 text-green-700 border-green-200" };
}

const ProfileLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { id: "overview", label: "Tổng quan", icon: User, to: "/profile" },
    { id: "orders", label: "Đơn đặt tour", icon: ShoppingBag, to: "/profile/orders" },
    { id: "security", label: "Bảo mật", icon: Lock, to: "/profile/security" },
    { id: "notifications", label: "Cài đặt thông báo", icon: Bell, to: "/profile/notifications" },
  ];

  if (!user) return null;

  const avatarUrl = user.avatar
    ? (user.avatar.startsWith('/storage')
      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${user.avatar}`
      : user.avatar)
    : null;

  const tier = getMemberTier((user as any).total_spent);

  return (
    <main className="bg-secondary/30 min-h-screen py-10">
      <div className="container max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-6">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary font-medium">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center">
              <div className="relative inline-block">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto overflow-hidden border-4 border-background shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <h2 className="mt-4 font-display font-bold text-foreground text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              
              <div className={cn("mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border", tier.color)}>
                {tier.label}
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <nav className="flex flex-col p-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || (item.to === "/profile" && location.pathname === "/profile");
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/70")} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="p-2 border-t border-border">
                <button 
                  onClick={() => { logout(); window.location.href = '/login'; }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-smooth"
                >
                  <LogOut className="h-4 w-4 text-destructive/70" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfileLayout;
