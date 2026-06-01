import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const icon = theme === "light" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : theme === "dark" ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <MonitorSmartphone className="h-[1.2rem] w-[1.2rem]" />;

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-md border border-border/50">
            {icon}
            <span className="sr-only">Cài đặt giao diện</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center font-display">Cài đặt giao diện</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              <Sun className={`h-8 w-8 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">Sáng</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              <Moon className={`h-8 w-8 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">Tối</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              <MonitorSmartphone className={`h-8 w-8 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">Tự động</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-md border border-border/50">
          {icon}
          <span className="sr-only">Đổi giao diện</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")} className={theme === "light" ? "bg-primary/10 text-primary font-bold" : ""}>
          <Sun className="mr-2 h-4 w-4" /> Sáng
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === "dark" ? "bg-primary/10 text-primary font-bold" : ""}>
          <Moon className="mr-2 h-4 w-4" /> Tối
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "bg-primary/10 text-primary font-bold" : ""}>
          <MonitorSmartphone className="mr-2 h-4 w-4" /> Tự động (Hệ thống)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
