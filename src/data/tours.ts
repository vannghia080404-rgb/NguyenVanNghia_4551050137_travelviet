import heroHalong from "@/assets/hero-halong.jpg";
import tourHoian from "@/assets/tour-hoian.jpg";
import tourSapa from "@/assets/tour-sapa.jpg";
import tourDanang from "@/assets/tour-danang.jpg";
import tourPhuquoc from "@/assets/tour-phuquoc.jpg";
import tourHue from "@/assets/tour-hue.jpg";
import tourNinhbinh from "@/assets/tour-ninhbinh.jpg";
import tourMekong from "@/assets/tour-mekong.jpg";
import tourDalat from "@/assets/tour-dalat.jpg";
import tourFood from "@/assets/tour-food.jpg";
import tourDragonBridge from "@/assets/tour-dragon-bridge.jpg";
import tourTemple from "@/assets/tour-temple.jpg";
import tourMarble from "@/assets/tour-marble.jpg";
import tourNhatrang from "@/assets/tour-nhatrang.jpg";

export type Tour = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  region: "north" | "central" | "south";
  duration: string;
  durationDays: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  badge?: string;
  highlights: string[];
  essentials: { label: string; value: string }[];
  description: string;
};

export const tours: Tour[] = [
  {
    id: "1",
    slug: "ha-long-bay-cruise",
    name: "Hạ Long Bay: Du thuyền 5 sao & Chèo Kayak",
    destination: "Hạ Long, Quảng Ninh",
    region: "north",
    duration: "3 ngày 2 đêm",
    durationDays: 3,
    price: 3850000,
    oldPrice: 4500000,
    rating: 4.9,
    reviews: 120,
    image: heroHalong,
    gallery: [heroHalong, tourTemple, tourMarble, tourFood],
    badge: "Bestseller",
    highlights: [
      "Du thuyền 5 sao qua đêm trên Vịnh Hạ Long",
      "Chèo kayak khám phá hang động",
      "Thưởng thức hải sản tươi sống",
      "Ngắm bình minh trên boong tàu",
    ],
    essentials: [
      { label: "Khởi hành", value: "Sân bay Nội Bài" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Khám phá" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Trải nghiệm vẻ đẹp kỳ vĩ của Vịnh Hạ Long – kỳ quan thiên nhiên thế giới – trên du thuyền 5 sao sang trọng. Hành trình 3 ngày kết hợp chèo kayak, ngắm cảnh và thưởng thức ẩm thực hải sản đặc sắc.",
  },
  {
    id: "2",
    slug: "hoi-an-ancient-town",
    name: "Khám phá Hội An: Thành phố Cổ & Làng gốm Thanh Hà",
    destination: "Hội An, Quảng Nam",
    region: "central",
    duration: "2 ngày 1 đêm",
    durationDays: 2,
    price: 1950000,
    oldPrice: 2200000,
    rating: 4.8,
    reviews: 85,
    image: tourHoian,
    gallery: [tourHoian, tourTemple, tourFood, tourDragonBridge],
    badge: "Selling",
    highlights: [
      "Đi thuyền hoa đăng trên sông Hoài",
      "Tham quan phố cổ Hội An về đêm",
      "Trải nghiệm làng gốm Thanh Hà",
      "Lớp học nấu món Cao Lầu truyền thống",
    ],
    essentials: [
      { label: "Khởi hành", value: "Sân bay Đà Nẵng" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Văn hoá" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Hành trình khám phá nét đẹp cổ kính của Hội An – di sản văn hoá thế giới – cùng những trải nghiệm văn hoá đặc sắc của miền Trung Việt Nam.",
  },
  {
    id: "3",
    slug: "sapa-trekking",
    name: "Mù Cang Chải: Mùa vàng Tây Bắc & Chụp ảnh nghệ thuật",
    destination: "Mù Cang Chải, Yên Bái",
    region: "north",
    duration: "4 ngày 3 đêm",
    durationDays: 4,
    price: 5400000,
    rating: 5.0,
    reviews: 42,
    image: tourSapa,
    gallery: [tourSapa, tourNinhbinh, tourTemple, tourFood],
    badge: "Selling",
    highlights: [
      "Săn ảnh ruộng bậc thang mùa lúa chín",
      "Trekking nhẹ qua bản làng dân tộc Mông",
      "Thưởng thức ẩm thực Tây Bắc",
      "Hướng dẫn viên là nhiếp ảnh gia chuyên nghiệp",
    ],
    essentials: [
      { label: "Khởi hành", value: "Hà Nội" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm nhỏ / Nhiếp ảnh" },
      { label: "Mức độ", value: "Trung bình" },
    ],
    description:
      "Khám phá vẻ đẹp lay động lòng người của Mù Cang Chải khi mùa lúa nhuộm vàng cả những thửa ruộng bậc thang kỳ vĩ.",
  },
  {
    id: "4",
    slug: "da-nang-bana-hills",
    name: "Đà Nẵng – Bà Nà Hills: Cầu Vàng & Fantasy Park",
    destination: "Đà Nẵng",
    region: "central",
    duration: "1 ngày",
    durationDays: 1,
    price: 1250000,
    rating: 4.7,
    reviews: 215,
    image: tourDanang,
    gallery: [tourDanang, tourDragonBridge, tourMarble, tourFood],
    badge: "Selling",
    highlights: [
      "Đi cáp treo dài nhất thế giới",
      "Check-in Cầu Vàng huyền thoại",
      "Vui chơi tại Fantasy Park",
      "Tham quan làng Pháp cổ điển",
    ],
    essentials: [
      { label: "Khởi hành", value: "Trung tâm Đà Nẵng" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Giải trí" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Một ngày khám phá kỳ quan Bà Nà Hills với cây Cầu Vàng nổi tiếng toàn cầu và khu vui chơi Fantasy Park đẳng cấp châu Á.",
  },
  {
    id: "5",
    slug: "phu-quoc-island",
    name: "Phú Quốc: Tour 4 đảo & Lặn ngắm san hô bằng cáp treo",
    destination: "Phú Quốc, Kiên Giang",
    region: "south",
    duration: "3 ngày 2 đêm",
    durationDays: 3,
    price: 3500000,
    oldPrice: 4100000,
    rating: 4.9,
    reviews: 156,
    image: tourPhuquoc,
    gallery: [tourPhuquoc, tourNhatrang, tourFood, tourDragonBridge],
    badge: "Selling",
    highlights: [
      "Cáp treo vượt biển dài nhất thế giới",
      "Lặn ngắm san hô tại 4 hòn đảo",
      "Tắm biển bãi Sao trắng mịn",
      "Thưởng thức hải sản tươi sống",
    ],
    essentials: [
      { label: "Khởi hành", value: "Sân bay Phú Quốc" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Biển đảo" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Khám phá đảo ngọc Phú Quốc với những bãi biển đẹp nhất Việt Nam và hệ sinh thái san hô đa dạng.",
  },
  {
    id: "6",
    slug: "da-lat-romance",
    name: "Đà Lạt Mộng Mơ: Hồ Tuyền Lâm & Thung lũng Tình Yêu",
    destination: "Đà Lạt, Lâm Đồng",
    region: "south",
    duration: "3 ngày 2 đêm",
    durationDays: 3,
    price: 2800000,
    rating: 4.6,
    reviews: 64,
    image: tourDalat,
    gallery: [tourDalat, tourFood, tourTemple, tourSapa],
    badge: "Selling",
    highlights: [
      "Ngắm hoàng hôn Hồ Tuyền Lâm",
      "Dạo bước Thung lũng Tình Yêu",
      "Tham quan vườn dâu tây",
      "Thưởng thức cà phê Đà Lạt",
    ],
    essentials: [
      { label: "Khởi hành", value: "Sân bay Liên Khương" },
      { label: "Ngôn ngữ", value: "Tiếng Việt" },
      { label: "Loại tour", value: "Nhóm / Lãng mạn" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Hành trình đến với thành phố ngàn hoa, nơi sương mù lãng mạn và những đồi thông xanh mướt mời gọi.",
  },
  {
    id: "7",
    slug: "hue-imperial",
    name: "Huế – Vẻ Đẹp Cố Đô",
    destination: "Huế, Thừa Thiên Huế",
    region: "central",
    duration: "2 ngày 1 đêm",
    durationDays: 2,
    price: 1900000,
    rating: 4.7,
    reviews: 91,
    image: tourHue,
    gallery: [tourHue, tourTemple, tourFood, tourDragonBridge],
    badge: "Selling",
    highlights: [
      "Tham quan Đại Nội Kinh thành Huế",
      "Đi thuyền rồng nghe ca Huế trên sông Hương",
      "Khám phá lăng tẩm các vua triều Nguyễn",
      "Thưởng thức ẩm thực cung đình",
    ],
    essentials: [
      { label: "Khởi hành", value: "Sân bay Phú Bài" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Văn hoá" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Khám phá vẻ đẹp trầm mặc của Cố đô Huế – nơi lưu giữ tinh hoa văn hoá triều Nguyễn và cảnh sắc thơ mộng của sông Hương núi Ngự.",
  },
  {
    id: "8",
    slug: "ninh-binh-trang-an",
    name: "Ninh Bình – Hạ Long Cạn",
    destination: "Ninh Bình",
    region: "north",
    duration: "1 ngày",
    durationDays: 1,
    price: 850000,
    rating: 4.9,
    reviews: 178,
    image: tourNinhbinh,
    gallery: [tourNinhbinh, tourTemple, tourFood, tourSapa],
    badge: "Selling",
    highlights: [
      "Du ngoạn Tràng An trên thuyền",
      "Tham quan chùa Bái Đính",
      "Leo hang Múa ngắm toàn cảnh",
      "Thưởng thức cơm cháy đặc sản",
    ],
    essentials: [
      { label: "Khởi hành", value: "Hà Nội" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Khám phá" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Khám phá danh thắng Tràng An trên những chiếc thuyền nan, len lỏi qua hang động và ngắm cảnh sắc kỳ vĩ.",
  },
  {
    id: "9",
    slug: "mekong-delta",
    name: "Miền Tây – Chợ nổi Cái Răng & Vườn trái cây",
    destination: "Cần Thơ, Tiền Giang",
    region: "south",
    duration: "2 ngày 1 đêm",
    durationDays: 2,
    price: 1650000,
    rating: 4.6,
    reviews: 73,
    image: tourMekong,
    gallery: [tourMekong, tourFood, tourPhuquoc, tourTemple],
    badge: "Selling",
    highlights: [
      "Chèo xuồng ba lá ở chợ nổi Cái Răng",
      "Thăm vườn trái cây miệt vườn",
      "Nghe đờn ca tài tử Nam Bộ",
      "Trải nghiệm làm bánh tráng",
    ],
    essentials: [
      { label: "Khởi hành", value: "TP. Hồ Chí Minh" },
      { label: "Ngôn ngữ", value: "Tiếng Việt, Anh" },
      { label: "Loại tour", value: "Nhóm / Sinh thái" },
      { label: "Mức độ", value: "Nhẹ nhàng" },
    ],
    description:
      "Khám phá miền sông nước Cửu Long với những chợ nổi sầm uất, vườn trái cây trĩu quả và văn hoá Nam Bộ chân chất.",
  },
];

export const destinations = [
  { name: "Đà Lạt", image: tourDalat, tours: 12, description: "Thành phố ngàn hoa với khí hậu ôn hoà quanh năm." },
  { name: "Nha Trang", image: tourNhatrang, tours: 8, description: "Thiên đường biển đảo miền Trung Việt Nam." },
  { name: "Miền Tây", image: tourMekong, tours: 10, description: "Sông nước Cửu Long và đời sống miệt vườn." },
  { name: "Đà Nẵng", image: tourDragonBridge, tours: 15, description: "Thành phố đáng sống nhất Việt Nam." },
];
