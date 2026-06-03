import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Menu, X, User, Heart, LogOut, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoLeaf from "@/assets/logo-leaf.png";
import { GlobalSettings } from "@/components/layout/GlobalSettings";

const links = [
  { to: "/", label: "Trang chủ" },
  { to: "/tours", label: "Tours" },
  { to: "/destinations", label: "Điểm đến" },
  { to: "/promotions", label: "Khuyến mãi" },
  { to: "/about", label: "Giới thiệu" },
  { to: "/contact", label: "Liên hệ" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist").then((r) => r.data.data || []),
    enabled: isAuthenticated,
  });
  const wishlistCount = wishlistData?.length || 0;

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => api.get("/notifications/unread-count").then((r) => r.data.count || 0),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unreadCount = unreadData || 0;

  return (
    <header className="sticky top-0 z-[999] w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white group-hover:scale-110 transition-smooth border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)] overflow-hidden">
            <img 
              src={logoLeaf} 
              alt="TravelViet" 
              className="h-8 w-8 object-contain mix-blend-multiply contrast-150" 
            />
          </div>
          <div className="leading-none">
            <span className="font-display text-xl font-bold text-primary block">TravelViet</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Khám phá Việt Nam</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <RouterNavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative text-sm font-medium transition-smooth py-2",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-accent" />
                  )}
                </>
              )}
            </RouterNavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <GlobalSettings />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="relative text-muted-foreground hover:text-accent transition-colors mt-1">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center border border-background">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/profile/notifications" className="relative text-muted-foreground hover:text-accent transition-colors mt-1 ml-2">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center border border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary flex items-center h-10 rounded-xl">
                    {user.avatar ? (
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-border/80 shrink-0">
                        <img 
                          src={user.avatar.startsWith('/storage') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${user.avatar}` : user.avatar} 
                          alt={user.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm text-foreground max-w-[120px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">Quản trị viên</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Hồ sơ cá nhân</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/orders" className="cursor-pointer">Đơn hàng của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="cursor-pointer">Tour yêu thích</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={async () => {
                      await logout();
                      window.location.href = "/";
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button asChild variant="accent" size="sm" className="rounded-lg px-5">
                <Link to="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <GlobalSettings />
          <button
            className="p-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container flex flex-col py-4 gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 border-t border-border mt-2">
              <Button asChild variant="ghost" size="sm" className="flex-1">
                <Link to="/login" onClick={() => setOpen(false)}>Đăng nhập</Link>
              </Button>
              <Button asChild variant="accent" size="sm" className="flex-1">
                <Link to="/register" onClick={() => setOpen(false)}>Đăng ký</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
