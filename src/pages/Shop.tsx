import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Package, Search, SlidersHorizontal, ChevronRight, Star, ShoppingBag } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Atropos from 'atropos/react';
import 'atropos/css';

export default function Shop() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${category === cat ? "bg-primary text-white shadow-md" : "bg-card text-foreground border hover:border-primary/50"
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
              <Atropos
                key={p.id}
                className="h-full group cursor-pointer"
                activeOffset={40}
                shadow={false}
                shadowOffset={0}
                highlight={false}
                onClick={() => navigate(`/shop/${p.slug}`)}
              >
                <div className="h-full bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all border border-border/50 flex flex-col relative">
                  {/* Glow Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                  
                  <div className="aspect-square bg-secondary/50 relative overflow-hidden z-20">
                    {p.image_url ? (
                      <img data-atropos-offset="-5" src={getImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package data-atropos-offset="-5" className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                    )}
                    {p.category && (
                      <div data-atropos-offset="10" className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-md text-gray-800 shadow-sm">
                        {p.category}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col z-20" data-atropos-offset="5">
                    <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors text-sm">{p.name}</h3>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{parseFloat(p.avg_rating || 0).toFixed(1)}</span>
                      </div>
                      <span>Đã bán {p.sold_count || 0}</span>
                    </div>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-bold text-primary text-lg">{new Intl.NumberFormat("vi-VN").format(p.base_price)}đ</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shop/${p.slug}`);
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Atropos>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
