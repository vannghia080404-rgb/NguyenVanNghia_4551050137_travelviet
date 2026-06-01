import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Users, Play, ShieldCheck, MapPin, Tag, Headphones, MousePointerClick, CreditCard, Backpack, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TourCard from "@/components/TourCard";
import Hero4D from "@/components/home/Hero3D";
import DestinationCarousel from "@/components/home/DestinationCarousel";
import PromoPopup from "@/components/home/PromoPopup";
import FeaturedPromotions from "@/components/home/FeaturedPromotions";
import { destinations } from "@/data/tours";
import api from "@/lib/api";

import Atropos from 'atropos/react';
import 'atropos/css';

const features = [
  { icon: ShieldCheck, title: "An Toàn Tuyệt Đối", desc: "Đội ngũ hướng dẫn viên chuyên nghiệp và bảo hiểm du lịch trọn gói." },
  { icon: MapPin, title: "Lịch Trình Độc Đáo", desc: "Những điểm đến ít người biết, trải nghiệm văn hoá bản địa sâu sắc." },
  { icon: Tag, title: "Giá Cả Cạnh Tranh", desc: "Cam kết giá tốt nhất thị trường với chất lượng dịch vụ 5 sao." },
  { icon: Headphones, title: "Hỗ Trợ 24/7", desc: "Luôn sẵn sàng giải đáp và hỗ trợ bạn trong suốt chuyến hành trình." },
];

const steps = [
  { icon: MousePointerClick, title: "Tìm Kiếm & Chọn Lựa", desc: "Khám phá tour du lịch ở những vùng miền bạn thuộc mong đợi của bạn." },
  { icon: CreditCard, title: "Đặt Chỗ Trực Tuyến", desc: "Thủ tục đơn giản, thanh toán an toàn qua hệ thống VNPay bảo mật." },
  { icon: Backpack, title: "Xách Balo Và Đi", desc: "Mọi thứ đã sẵn sàng, TravelViet sẽ đồng hành cùng bạn suốt chuyến đi." },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15
    }
  },
  viewport: { once: true }
};

const Home = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { data: featuredTours, isLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: async () => {
      const res = await api.get('/tours?featured=1');
      return res.data?.data || [];
    }
  });

  const featured = (featuredTours && Array.isArray(featuredTours)) ? featuredTours.slice(0, 6) : [];

  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      {/* Khuyến mãi Popup (Auto-show) */}
      <PromoPopup />

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-6 right-6 z-10 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/k8m0SaGQ_1c?autoplay=1&rel=0&modestbranding=1&controls=1"
                title="TravelViet Official Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-view; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-end pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          {/* 4D Immersive Container */}
          <div className="absolute inset-0 z-0">
            <Hero4D />
          </div>
        </div>

        <div className="relative z-[100] w-full px-8 md:px-16 lg:px-24 pt-32 text-white">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 bg-primary/90 text-primary-foreground rounded-full text-xs font-bold tracking-wide uppercase shadow-glow"
          >
            Authentic Vietnamese Experience
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 font-display text-2xl md:text-4xl lg:text-5xl font-bold max-w-xl leading-[1.15] drop-shadow-2xl"
          >
            Khám phá Việt Nam<br />
            <span className="text-primary italic">theo cách của bạn</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-4 max-w-md text-sm md:text-base text-white/90 leading-relaxed drop-shadow-lg"
          >
            Đắm chìm trong những cung đường di sản, những kỳ quan thiên nhiên và nhịp sống bản địa đậm bản sắc tâm hồn Việt.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Atropos 
              className="rounded-xl cursor-pointer overflow-hidden shadow-[0_10px_30px_rgba(251,191,36,0.4)]" 
              shadow={false} 
              highlight={false}
              onClick={() => navigate("/tours")}
            >
              <Button variant="hero" size="xl" className="bg-primary text-primary-foreground hover:scale-105 transition-transform duration-300 w-full pointer-events-none select-none">
                <span data-atropos-offset="5">Khám phá tour ngay</span>
              </Button>
            </Atropos>
            <Atropos 
              className="rounded-xl cursor-pointer overflow-hidden" 
              activeOffset={30} 
              shadow={false} 
              highlight={false}
              onClick={() => setShowVideo(true)}
            >
              <div 
                className="h-14 px-8 rounded-xl gap-2 flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/30 text-white hover:bg-white/10 transition-all font-medium no-underline w-full pointer-events-none select-none"
              >
                <Play className="h-4 w-4 fill-current" data-atropos-offset="5" />
                <span data-atropos-offset="5">Xem Video</span>
              </div>
            </Atropos>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 lg:mt-12 bg-card/40 backdrop-blur-xl rounded-3xl shadow-elevated p-4 md:p-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] border border-white/10 max-w-4xl"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <MapPin className="h-4 w-4 text-primary" /> Điểm đến
              </label>
              <Input 
                placeholder="Bạn muốn đi đâu?" 
                className="border-0 bg-background/30 h-12 focus-visible:ring-1 focus-visible:ring-primary text-foreground rounded-xl" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <Calendar className="h-4 w-4 text-primary" /> Ngày đi
              </label>
              <Input type="date" className="border-0 bg-background/30 h-12 focus-visible:ring-1 text-foreground rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <Users className="h-4 w-4 text-primary" /> Số người
              </label>
              <select className="w-full h-12 rounded-xl bg-background/30 px-4 text-sm focus-visible:ring-1 focus-visible:ring-ring outline-none text-foreground border-0">
                <option>2 Người lớn, 0 Trẻ em</option>
                <option>1 Người lớn</option>
                <option>2 Người lớn, 1 Trẻ em</option>
                <option>4 Người lớn</option>
              </select>
            </div>
            <Button asChild size="lg" className="h-12 md:h-auto md:w-16 rounded-xl md:self-end bg-gradient-to-r from-primary to-accent text-accent-foreground hover:scale-105 transition-transform shadow-glow">
              <Link to={`/tours?search=${searchKeyword}`} aria-label="Tìm kiếm">
                <Search className="h-6 w-6" />
                <span className="md:hidden">Tìm</span>
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Lớp mờ mỏng ở dưới cùng để nối với section sau, không làm mờ chủ thể video */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
      </section>

      {/* KHUYẾN MÃI & ƯU ĐÃI NỔI BẬT */}
      <FeaturedPromotions />

      {/* WHY CHOOSE */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="container py-24 relative"
      >
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Tại sao nên chọn <span className="text-primary">TravelViet?</span>
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-primary" />
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="h-full rounded-3xl"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="group bg-card/80 backdrop-blur-md rounded-3xl p-8 shadow-soft hover:shadow-card transition-all border border-border h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors relative z-10">
                    <f.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground relative z-10">{f.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed relative z-10">{f.desc}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FEATURED TOURS */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="container pb-24"
      >
        <div className="flex items-end justify-between mb-12">
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Tour Nổi Bật</h2>
            <p className="mt-3 text-lg text-muted-foreground">Gợi ý những hành trình được yêu thích nhất tháng này</p>
          </motion.div>
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView">
            <Link to="/tours" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Xem tất cả <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : featured.length > 0 ? (
            featured.map((t: any, i: number) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TourCard tour={t} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border">
              Không có tour nào nổi bật lúc này.
            </div>
          )}
        </div>
      </motion.section>

      {/* DESTINATIONS */}
      <section className="bg-secondary/20 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="container">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Điểm Đến Phổ Biến</h2>
            <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <DestinationCarousel />
          </motion.div>
        </div>
      </section>

      {/* 3 STEPS */}
      <section className="container py-24">
        <motion.h2
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          className="text-center font-display text-3xl md:text-5xl font-bold text-foreground mb-16"
        >
          3 Bước Để Bắt Đầu Hành Trình
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto"
        >
          {steps.map((s, i) => (
            <motion.div key={s.title} variants={fadeInUp} className="text-center group">
              <div className="relative inline-flex mb-8">
                <Atropos
                  className="rounded-3xl h-20 w-20 overflow-hidden"
                  activeOffset={40}
                  shadow={true}
                  shadowOffset={40}
                  highlight={false}
                >
                  <div className="h-full w-full rounded-3xl gradient-accent flex items-center justify-center shadow-glow group-hover:shadow-accent/50 transition-all">
                    <s.icon data-atropos-offset="10" className="h-9 w-9 text-accent-foreground" />
                  </div>
                </Atropos>
                <span className="absolute -top-2 -right-2 h-10 w-10 rounded-2xl bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center shadow-soft border-4 border-background">
                  {i + 1}
                </span>

                {i < 2 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-24 h-px border-t-2 border-dashed border-border mx-4" />
                )}
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto text-lg">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </main>
  );
};

export default Home;
