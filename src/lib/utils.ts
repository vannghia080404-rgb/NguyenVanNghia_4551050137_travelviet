import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("blob:")) return path;
  if (path.startsWith("data:image")) return path;
  
  // Clean up double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://127.0.0.1:8000${cleanPath}`;
}
