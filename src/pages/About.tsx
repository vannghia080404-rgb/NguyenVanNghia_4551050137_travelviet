import { Link } from "react-router-dom";
import { Heart, Globe2, Users, Award, Leaf, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/store/useSettingsStore";
import api from "@/lib/api";
import { sanitizeHTML } from "@/lib/utils";
import heroImage from "@/assets/hero-halong1111.jpg";
import tourHoian from "@/assets/tour-hoian.jpg";
import tourFood from "@/assets/tour-food.jpg";

const values = [
  { icon: Heart, title: "Tận tâm phục vụ", desc: "Mỗi chuyến đi là một câu chuyện riêng, được thiết kế phù hợp với từng du khách." },
  { icon: Leaf, title: "Du lịch bền vững", desc: "Tôn trọng văn hoá bản địa và bảo vệ môi trường tại mọi điểm đến." },
  { icon: Globe2, title: "Trải nghiệm chân thực", desc: "Đưa bạn đến với linh hồn Việt Nam – nơi không có trong sách hướng dẫn." },
  { icon: Award, title: "Chất lượng cam kết", desc: "Đội ngũ hướng dẫn viên bản địa được đào tạo bài bản, dịch vụ 5 sao." },
];

const About = () => {
  const { settings } = useSettingsStore();

  const { data: teamData } = useQuery({
    queryKey: ['team-members-public'],
    queryFn: () => api.get('/team-members').then(r => r.data.data || []),
  });

  // Use CMS team data from API; fall back to empty if not yet added by admin
  const team = teamData && teamData.length > 0 ? teamData : [];

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="About TravelViet" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative text-center text-white z-10 px-4">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Câu chuyện của chúng tôi</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Về <span className="text-accent">TravelViet</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Hành trình kết nối trái tim Việt với thế giới
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="TravelViet Stats" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-primary/80 to-black/80 mix-blend-multiply" />

        <div className="container relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-md">{settings.stat_experience_years || "10+"}</div>
            <div className="mt-2 text-sm md:text-base font-medium text-white/90 uppercase tracking-wider">Năm kinh nghiệm</div>
          </div>
          <div>
            <div className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-md">{settings.stat_happy_customers || "15.000+"}</div>
            <div className="mt-2 text-sm md:text-base font-medium text-white/90 uppercase tracking-wider">Khách hàng hài lòng</div>
          </div>
          <div>
            <div className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-md">{settings.stat_destinations || "200+"}</div>
            <div className="mt-2 text-sm md:text-base font-medium text-white/90 uppercase tracking-wider">Điểm đến</div>
          </div>
          <div>
            <div className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-md">{settings.stat_rating || "4.9/5"}</div>
            <div className="mt-2 text-sm md:text-base font-medium text-white/90 uppercase tracking-wider">Đánh giá trung bình</div>
          </div>
        </div>
      </section>

      {/* Story + CMS about content */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Câu chuyện</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              Sinh ra từ tình yêu với quê hương
            </h2>
            {settings.page_about ? (
              <div
                className="mt-6 text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(settings.page_about) }}
              />
            ) : (
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  TravelViet ra đời năm 2014 với một sứ mệnh đơn giản: <strong className="text-foreground">đưa vẻ đẹp thực sự của Việt Nam đến với thế giới.</strong>
                </p>
                <p>
                  Chúng tôi không chỉ bán tour. Chúng tôi kể chuyện — qua từng bữa ăn đường phố, qua từng buổi bình minh trên ruộng bậc thang, qua nụ cười của những người dân bản địa.
                </p>
                <p>
                  Với hơn 10 năm kinh nghiệm, TravelViet tự hào là người bạn đồng hành tin cậy của hàng ngàn du khách trong và ngoài nước.
                </p>
              </div>
            )}
            <Button asChild variant="hero" size="lg" className="mt-8">
              <Link to="/tours">Khám phá ngay</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={tourHoian} alt="Hội An" className="rounded-2xl object-cover h-52 w-full shadow-lg" />
            <img src={tourFood} alt="Ẩm thực" className="rounded-2xl object-cover h-52 w-full shadow-lg mt-8" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Giá trị cốt lõi</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-primary">
              Những điều chúng tôi tin tưởng
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-smooth group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-smooth">
                  <v.icon className="h-6 w-6 text-primary group-hover:text-white transition-smooth" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto bg-primary/5 rounded-3xl p-10 text-center relative">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-4" />
          <blockquote className="font-display text-xl md:text-2xl font-bold text-foreground italic leading-relaxed">
            "Mỗi chuyến đi là một cơ hội để hiểu hơn về đất nước, con người và chính mình."
          </blockquote>
          <cite className="block mt-6 text-sm font-semibold text-primary not-italic">— Đội ngũ TravelViet</cite>
        </div>
      </section>

      {/* Team — Dynamic from CMS */}
      <section className="container pb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Đội ngũ</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-primary">
            Những người làm nên hành trình
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">Thành Viên</p>
        </div>
        {team.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 bg-secondary/30 rounded-2xl">
            <Users className="h-10 w-10 mx-auto opacity-30 mb-3" />
            <p>Thông tin đội ngũ đang được cập nhật...</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m: any) => {
              const imgSrc = m.image_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${m.image_url}` : tourFood;
              return (
                <div key={m.id} className="group rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-card transition-smooth">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={imgSrc} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground">{m.name}</h3>
                    <p className="text-sm text-accent font-medium mt-1">{m.role}</p>
                    {m.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.bio}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default About;
