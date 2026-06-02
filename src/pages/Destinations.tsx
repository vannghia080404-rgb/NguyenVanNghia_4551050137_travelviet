import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tours } from "@/data/tours";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import heroImage from "@/assets/hero-halong1111.jpg";
import tourHoian from "@/assets/tour-hoian.jpg";
import tourSapa from "@/assets/tour-sapa.jpg";
import tourDanang from "@/assets/tour-danang.jpg";
import tourPhuquoc from "@/assets/tour-phuquoc.jpg";
import tourHue from "@/assets/tour-hue.jpg";
import tourNinhbinh from "@/assets/tour-ninhbinh.jpg";
import tourMekong from "@/assets/tour-mekong.jpg";
import tourDalat from "@/assets/tour-dalat.jpg";
import tourNhatrang from "@/assets/tour-nhatrang.jpg";

const regions = [
  {
    key: "north",
    title: "Miền Bắc",
    subtitle: "Núi rừng hùng vĩ & văn hoá nghìn năm",
    description:
      "Khám phá Vịnh Hạ Long kỳ ảo, ruộng bậc thang Sapa, phố cổ Hà Nội và những di sản trầm mặc của châu thổ sông Hồng.",
    image: heroImage,
  },
  {
    key: "central",
    title: "Miền Trung",
    subtitle: "Di sản, biển xanh & đèo cao",
    description:
      "Hội An lung linh đèn lồng, kinh đô Huế cổ kính, Đà Nẵng năng động và những bãi biển trải dài óng ánh.",
    image: tourHoian,
  },
  {
    key: "south",
    title: "Miền Nam",
    subtitle: "Sông nước, đảo ngọc & nắng vàng",
    description:
      "Sài Gòn không ngủ, Phú Quốc thiên đường biển đảo, miền Tây sông nước và những vườn trái cây trĩu quả.",
    image: tourPhuquoc,
  },
] as const;

const destinationGrid = [
  { name: "Hạ Long", province: "Quảng Ninh", image: heroImage, tours: 12, region: "Miền Bắc" },
  { name: "Sapa", province: "Lào Cai", image: tourSapa, tours: 9, region: "Miền Bắc" },
  { name: "Ninh Bình", province: "Ninh Bình", image: tourNinhbinh, tours: 7, region: "Miền Bắc" },
  { name: "Huế", province: "Thừa Thiên Huế", image: tourHue, tours: 8, region: "Miền Trung" },
  { name: "Hội An", province: "Quảng Nam", image: tourHoian, tours: 14, region: "Miền Trung" },
  { name: "Đà Nẵng", province: "Đà Nẵng", image: tourDanang, tours: 15, region: "Miền Trung" },
  { name: "Nha Trang", province: "Khánh Hoà", image: tourNhatrang, tours: 10, region: "Miền Trung" },
  { name: "Đà Lạt", province: "Lâm Đồng", image: tourDalat, tours: 12, region: "Miền Nam" },
  { name: "Phú Quốc", province: "Kiên Giang", image: tourPhuquoc, tours: 11, region: "Miền Nam" },
  { name: "Miền Tây", province: "Cần Thơ", image: tourMekong, tours: 9, region: "Miền Nam" },
];

const Destinations = () => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["featured-tours"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/tours?featured=true&per_page=8&page=${pageParam}`);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });

  const featuredTours = data?.pages.flatMap((page) => page.data) || [];

  const displayTours = featuredTours.map((t: any) => ({
    name: t.name,
    province: t.destination?.name || "Việt Nam",
    image: t.image || heroImage,
    tours: t.duration || "", // reuse tours field for duration text
    region: t.region || t.destination?.region || "Miền Nam",
    slug: t.slug
  }));

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative h-[420px] overflow-hidden">
        <img src={heroImage} alt="Điểm đến Việt Nam" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="relative container h-full flex flex-col justify-center text-primary-foreground">
          <span className="inline-flex w-fit items-center gap-2 px-4 py-1.5 bg-accent/90 text-accent-foreground rounded-full text-xs font-semibold uppercase tracking-wide">
            <Compass className="h-3.5 w-3.5" /> Khám phá Việt Nam
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold max-w-3xl text-white drop-shadow-lg">
            Những điểm đến không thể bỏ lỡ
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-md">
            Từ đỉnh núi Fansipan tới đảo ngọc Phú Quốc – mỗi vùng đất là một câu chuyện đang chờ bạn viết tiếp.
          </p>
        </div>
      </section>

      {/* Regions */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Ba miền – Ba sắc thái</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-primary">
            Hành trình xuyên Việt
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {regions.map((r) => (
            <article key={r.key} className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-smooth">
              <div className="relative h-72 overflow-hidden">
                <img src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white drop-shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">{r.subtitle}</span>
                  <h3 className="mt-1 font-display text-3xl font-bold">{r.title}</h3>
                </div>
              </div>
              <div className="p-6 bg-card">
                <p className="text-muted-foreground text-sm leading-relaxed">{r.description}</p>
                <Button asChild variant="ghost" size="sm" className="mt-4 px-0 text-primary hover:bg-transparent hover:text-accent">
                  <Link to={`/tours?region=${r.key}`}>Xem tour <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Destination grid */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Top Tour Nổi Bật</h2>
              <p className="mt-2 text-muted-foreground">Những hành trình được du khách yêu thích nhất năm 2024</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/tours">Xem tất cả tour</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : displayTours.length === 0 ? (
            <div className="flex justify-center items-center h-40 w-full text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Hiện tại chưa có tour nổi bật nào.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {displayTours.map((t: any) => (
                <Link
                  key={t.name}
                  to={`/tours/${t.slug}`}
                  className="group relative rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-smooth"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <MapPin className="h-3 w-3" /> {t.province}
                    </div>
                    <h3 className="font-display text-xl font-bold mt-1 line-clamp-2">{t.name}</h3>
                    <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {String(t.tours).includes("ngày") ? t.tours : `${t.tours} lượt đặt`}
                      </span>
                      <span className="text-white/80">{t.region}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Xem thêm tour
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-white text-center shadow-elevated group">
          <img src={heroImage} alt="Hành trình Việt Nam" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold drop-shadow-lg">Sẵn sàng cho hành trình của bạn?</h2>
            <p className="mt-4 max-w-xl mx-auto text-white/90 drop-shadow-md">
              Hơn {tours.length * 20}+ tour được tuyển chọn kỹ lưỡng, đội ngũ hướng dẫn viên bản địa giàu kinh nghiệm.
            </p>
            <Button asChild variant="hero" size="xl" className="mt-8 shadow-glow transition-transform hover:scale-105">
              <Link to="/tours">Khám phá ngay <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Destinations;
