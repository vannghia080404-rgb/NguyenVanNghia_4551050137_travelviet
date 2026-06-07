import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Navigation, CheckCircle2, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getEmbedUrl, getMapAddress } from "@/lib/mapUtils";
import { cn } from "@/lib/utils";

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AdminMapPickerProps {
  value: string;
  onChange: (value: string) => void;
  tourName?: string;
  destinationName?: string;
}

const LocationMarker = ({ position, setPosition, setDisplayName }: any) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom() < 12 ? 14 : map.getZoom(), {
        duration: 1.5
      });
    }
  }, [position, map]);

  useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setDisplayName(data.display_name.split(',').slice(0, 3).join(','));
        }
      } catch (err) {
        console.error("Reverse geocoding error", err);
      }
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

export const AdminMapPicker = ({ value, onChange, tourName = "", destinationName = "" }: AdminMapPickerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapType, setMapType] = useState<"street" | "satellite">("street");
  
  // Extract initial position from value if possible
  useEffect(() => {
    if (value && !position) {
      const coordMatch = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || value.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        setPosition(new L.LatLng(parseFloat(coordMatch[1]), parseFloat(coordMatch[2])));
      }
      setDisplayName(getMapAddress(value, ""));
    }
  }, [value]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setPosition(new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon)));
        if (!displayName) setDisplayName(data[0].display_name.split(',')[0]);
      }
    } catch (e) {
      console.error("Geocoding error", e);
    }
    setIsSearching(false);
  };

  const syncFromUrl = () => {
    const coordMatch = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || value.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      setPosition(new L.LatLng(parseFloat(coordMatch[1]), parseFloat(coordMatch[2])));
    }
    const name = getMapAddress(value, "");
    if (name) setDisplayName(name);
  };

  const handleConfirm = () => {
    if (position) {
      // Generate a google maps place URL
      let newUrl = `https://www.google.com/maps/place/${encodeURIComponent(displayName || "Location")}/@${position.lat},${position.lng},16z`;
      onChange(newUrl);
    } else if (displayName) {
      onChange(`https://www.google.com/maps?q=${encodeURIComponent(displayName)}`);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* 1. Vị trí Google Maps Input */}
      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">VỊ TRÍ (GOOGLE MAPS)</h3>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.google.com/maps/place/..."
            className="pl-10 h-11 border-border/80"
          />
        </div>
      </div>

      {/* 2. Xem trước bản đồ thực tế */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
            <MapPin className="h-4 w-4" />
            Xem trước bản đồ thực tế (Google Maps)
          </div>
          <span className="text-xs text-muted-foreground italic">Hiển thị ngoài trang chi tiết Tour</span>
        </div>
        <div className="h-[250px] w-full bg-muted relative">
          {(value || tourName) ? (
            <iframe
              src={getEmbedUrl(value, tourName, destinationName)}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Chưa có dữ liệu bản đồ
            </div>
          )}
        </div>
      </div>

      {/* 3. Bộ định vị kéo thả */}
      <div className="bg-[#1a1f2c] rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-[#222836] px-4 py-3 border-b border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
            <MapPin className="h-4 w-4" />
            Bộ định vị kéo thả vị trí (Shopee Style)
            <span className="text-xs font-normal text-muted-foreground ml-2 hidden md:inline">
              Kéo thả ghim đồ hoặc click trực tiếp lên bản đồ để chọn vị trí chính xác nhất
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-background/50 rounded-lg p-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 text-xs font-semibold px-3", mapType === "street" ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "text-muted-foreground")}
                onClick={() => setMapType("street")}
              >
                Bản đồ
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 text-xs font-semibold px-3", mapType === "satellite" ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "text-muted-foreground")}
                onClick={() => setMapType("satellite")}
              >
                Vệ tinh
              </Button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={syncFromUrl} className="h-9 gap-2 border-border/50 bg-[#1a1f2c]">
              <RotateCw className="h-3 w-3" /> Đồng bộ từ URL
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Search box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Tìm địa danh/địa chỉ (VD: Bà Nà Hills, Đà Nẵng)..."
              className="pl-10 pr-[100px] h-11 bg-[#151923] border-border/50 rounded-full"
            />
            <Button 
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-1 top-1 bottom-1 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6"
            >
              Tìm kiếm
            </Button>
          </div>

          {/* Leaflet Map */}
          <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border/50 relative z-0">
            <MapContainer 
              center={position || [13.755584, 109.226296]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              {mapType === "street" ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution="Google Maps Satellite"
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                />
              )}
              <LocationMarker position={position} setPosition={setPosition} setDisplayName={setDisplayName} />
            </MapContainer>
          </div>

          {/* Location details card */}
          <div className="bg-[#151923] border border-border/50 rounded-xl p-4 mt-4">
            <h4 className="text-xs font-semibold text-amber-500 uppercase flex items-center gap-2 mb-3">
              <MapPin className="h-3 w-3" /> TÊN ĐỊA DANH HIỂN THỊ (CÓ THỂ SỬA)
            </h4>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="Nhập tên địa danh..."
              className="bg-[#1a1f2c] border-border/50 h-11 font-medium mb-3"
            />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="text-foreground/70">Địa chỉ thực tế:</span> {displayName || "Chưa xác định"}</p>
                <p><span className="text-foreground/70">Tọa độ GPS:</span> {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : "Chưa xác định"}</p>
              </div>
              
              <Button 
                type="button"
                onClick={handleConfirm}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 h-10"
              >
                <CheckCircle2 className="h-4 w-4" /> Xác nhận & Cập nhật vị trí
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
