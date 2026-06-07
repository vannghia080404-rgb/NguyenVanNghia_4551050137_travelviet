import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'blockquote', 'span', 'div', 'iframe'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height', 'frameborder', 'allowfullscreen', 'loading', 'referrerpolicy', 'title'],
    ALLOW_DATA_ATTR: false,
  });
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF)' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File vượt quá 5MB cho phép' };
  }
  return { valid: true };
}
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  
  // Force HTTPS for mixed content issues
  if (path.startsWith("http://travelviet.onrender.com")) {
    return path.replace("http://", "https://");
  }
  
  if (path.startsWith("http")) return path;
  if (path.startsWith("blob:")) return path;
  if (path.startsWith("data:image")) return path;
  
  // Clean up double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
  
  // Enforce https if baseUrl is production
  if (baseUrl.includes('onrender.com')) {
    return `${baseUrl.replace('http://', 'https://')}${cleanPath}`;
  }
  
  return `${baseUrl}${cleanPath}`;
}
