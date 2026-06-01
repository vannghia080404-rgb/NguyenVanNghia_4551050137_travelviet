import { Moon, Sun, MonitorSmartphone, Settings2, Type, Zap, TypeOutline, TextSelect } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/store/useUIStore";

export function GlobalSettings() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { animations, setAnimations, fontSize, setFontSize } = useUIStore();
  const [open, setOpen] = useState(false);

  const SettingsContent = () => (
    <div className="p-6 space-y-8">
      {/* 1. Theme Settings */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" /> Giao diện
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"}`}
          >
            <Sun className={`h-6 w-6 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs font-semibold">Sáng</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"}`}
          >
            <Moon className={`h-6 w-6 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs font-semibold">Tối</span>
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"}`}
          >
            <MonitorSmartphone className={`h-6 w-6 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs font-semibold">Hệ thống</span>
          </button>
        </div>
      </div>

      {/* 2. Text Settings */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" /> Cỡ chữ
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFontSize("normal")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${fontSize === "normal" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            <TypeOutline className="h-4 w-4" /> Tiêu chuẩn
          </button>
          <button
            onClick={() => setFontSize("large")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${fontSize === "large" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            <TextSelect className="h-5 w-5" /> To hơn
          </button>
        </div>
      </div>

      {/* 3. Advanced Settings */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Trải nghiệm
        </h3>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-bold text-foreground">Hiệu ứng chuyển động</Label>
            <p className="text-xs text-muted-foreground">Bật/tắt hoạt ảnh để lướt web nhanh hơn</p>
          </div>
          <Switch checked={animations} onCheckedChange={setAnimations} />
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <Button className="w-full font-bold rounded-xl" onClick={() => setOpen(false)}>Hoàn tất</Button>
      </div>
    </div>
  );

  const triggerButton = (
    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-md border border-border/50 hover:bg-secondary">
      <Settings2 className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Cài đặt hệ thống</span>
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {triggerButton}
        </DrawerTrigger>
        <DrawerContent className="z-[9999]">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle className="text-center font-display text-xl text-foreground">Tùy chỉnh Trải nghiệm</DrawerTitle>
          </DrawerHeader>
          <SettingsContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 rounded-2xl shadow-elevated border-border z-[9999] bg-background">
        <div className="border-b border-border p-4 text-center">
          <h2 className="font-display text-xl font-bold text-foreground">Tùy chỉnh Trải nghiệm</h2>
        </div>
        <SettingsContent />
      </PopoverContent>
    </Popover>
  );
}
