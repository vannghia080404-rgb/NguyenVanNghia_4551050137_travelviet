import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { useAuthStore } from "@/store/useAuthStore";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Home.tsx";
import Tours from "./pages/Tours.tsx";
import TourDetail from "./pages/TourDetail.tsx";
import Promotions from "./pages/Promotions.tsx";
import BookingPage from "./pages/BookingPage.tsx";
import PaymentResult from "./pages/PaymentResult.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ProfileOrders from "./pages/ProfileOrders.tsx";
import ProfileShopOrders from "./pages/ProfileShopOrders.tsx";
import Profile from "./pages/Profile.tsx";
import ProfileNotifications from "./pages/ProfileNotifications.tsx";
import ProfileSecurity from "./pages/ProfileSecurity.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import PaymentTransfer from "./pages/PaymentTransfer.tsx";
import Destinations from "./pages/Destinations.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminTours from "./pages/admin/AdminTours.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";
import AdminReviews from "./pages/admin/AdminReviews.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminHotels from "./pages/admin/AdminHotels.tsx";
import AdminDestinations from "./pages/admin/AdminDestinations.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminBroadcast from "./pages/admin/AdminBroadcast.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminTeamMembers from "./pages/admin/AdminTeamMembers.tsx";
import AdminRanks from "./pages/admin/AdminRanks.tsx";
import AdminPromotions from "./pages/admin/AdminPromotions.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminShopOrders from "./pages/admin/AdminShopOrders.tsx";
import AdminProfile from "./pages/admin/AdminProfile.tsx";
import Shop from "./pages/Shop.tsx";
import ShopProductDetail from "./pages/ShopProductDetail.tsx";
import ShopCart from "./pages/ShopCart.tsx";
import ShopCheckout from "./pages/ShopCheckout.tsx";
import NotFound from "./pages/NotFound.tsx";

import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import ChatWidget from "@/components/ChatWidget";

const queryClient = new QueryClient();

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  
  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, [checkAuth, fetchSettings]);

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

const RenderedRoute = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><Index /></Layout></RenderedRoute></motion.div>} />
        <Route path="/tours" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><Tours /></Layout></RenderedRoute></motion.div>} />
        <Route path="/promotions" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><Promotions /></Layout></RenderedRoute></motion.div>} />
        <Route path="/tours/:slug" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><TourDetail /></Layout></RenderedRoute></motion.div>} />
        <Route path="/booking/:slug" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><BookingPage /></Layout></RenderedRoute></motion.div>} />
        <Route path="/payment-result" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><PaymentResult /></Layout></RenderedRoute></motion.div>} />
        <Route path="/destinations" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><Destinations /></Layout></RenderedRoute></motion.div>} />
        <Route path="/about" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><About /></Layout></RenderedRoute></motion.div>} />
        <Route path="/contact" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><Contact /></Layout></RenderedRoute></motion.div>} />
        <Route path="/login" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Login /></RenderedRoute></motion.div>} />
        <Route path="/register" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Register /></RenderedRoute></motion.div>} />
        <Route path="/forgot-password" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ForgotPassword /></RenderedRoute></motion.div>} />
        <Route path="/shop" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><Shop /></Layout></RenderedRoute></motion.div>} />
        <Route path="/shop/:slug" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><ShopProductDetail /></Layout></RenderedRoute></motion.div>} />
        <Route path="/cart" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><ProtectedRoute><ShopCart /></ProtectedRoute></Layout></RenderedRoute></motion.div>} />
        <Route path="/checkout-shop" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><Layout><ProtectedRoute><ShopCheckout /></ProtectedRoute></Layout></RenderedRoute></motion.div>} />
        <Route path="/profile/orders" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute><ProfileOrders /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/profile/shop-orders" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute><ProfileShopOrders /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/profile" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute><Profile /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/profile/notifications" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute><ProfileNotifications /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/profile/security" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute><ProfileSecurity /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/wishlist" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute><Wishlist /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/auth/callback" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><AuthCallback /></RenderedRoute></motion.div>} />
        <Route path="/reset-password" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ResetPassword /></RenderedRoute></motion.div>} />
        <Route path="/payment/transfer/:bookingId" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><PaymentTransfer /></RenderedRoute></motion.div>} />
        <Route path="/admin" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/tours" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminTours /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/bookings" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminBookings /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/reviews" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminReviews /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/users" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/reports" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/hotels" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminHotels /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/destinations" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminDestinations /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/shop/products" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/shop/orders" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminShopOrders /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/categories" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/broadcast" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminBroadcast /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/ranks" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminRanks /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/promotions" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminPromotions /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/settings" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/team" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminTeamMembers /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="/admin/profile" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><ProtectedRoute requireAdmin><AdminProfile /></ProtectedRoute></RenderedRoute></motion.div>} />
        <Route path="*" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}><RenderedRoute><NotFound /></RenderedRoute></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const { animations } = useUIStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <HelmetProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AuthInitializer>
                <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground selection:bg-primary/20">
                  <MotionConfig reducedMotion={animations ? "user" : "always"}>
                    <AnimatedRoutes />
                  </MotionConfig>
                  <Sonner position="top-right" theme="system" className="font-sans" />
                  <Toaster />
                  <ChatWidget />
                </div>
              </AuthInitializer>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </ThemeProvider>

    </QueryClientProvider>
  );
};

export default App;
