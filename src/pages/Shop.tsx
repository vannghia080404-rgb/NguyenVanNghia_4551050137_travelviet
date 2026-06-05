import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Package, Search, ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Shop() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products", category],
    queryFn: () => api.get(`/shop/products?category=${category}`).then((res) => res.data.data),
  });

  const filteredProducts = products?.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Cửa Hàng TravelViet</h1>
            <p className="text-muted-foreground mt-2">Sắm đồ chuẩn bị cho chuyến đi tuyệt vời của bạn</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm tên sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card" />
            </div>
            <Link to="/cart">
              <Button variant="outline" className="gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border-primary/20">
                <ShoppingBag className="h-4 w-4" />
                Giỏ hàng
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide mb-8">
          {["all", "Đồ bơi", "Mũ / Nón", "Giày / Dép", "Phụ kiện"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                category === cat ? "bg-primary text-white shadow-md" : "bg-card text-foreground border hover:border-primary/50"
              }`}
            >
              {cat === "all" ? "Tất cả" : cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p: any) => (
              <Link key={p.id} to={`/shop/${p.slug}`} className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all border border-border/50 flex flex-col">
                <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                  {p.image_url ? (
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${p.image_url}`} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Package className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                  )}
                  {p.category && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-md text-gray-800 shadow-sm">
                      {p.category}
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.name}</h3>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="font-bold text-primary text-lg">{new Intl.NumberFormat("vi-VN").format(p.base_price)}đ</span>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white">
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
