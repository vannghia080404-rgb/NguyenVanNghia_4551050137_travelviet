export const getCleanMapUrl = (mapUrl: string) => {
  if (!mapUrl) return "";
  let url = mapUrl.trim();
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }
  return url;
};

export const getEmbedUrl = (mapUrl: string, tourName: string = "", destinationName: string = "") => {
  if (!mapUrl) return "";
  
  let url = mapUrl.trim();

  // 0. If it contains an iframe HTML tag, extract the src URL
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }

  // 1. If it's already an embed URL, use it directly!
  if (url.includes("/maps/embed") || url.includes("output=embed")) {
    return url;
  }
  
  // 2. Try to extract coordinates like @15.9995511,107.9943547 FIRST to ensure absolute positioning accuracy!
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
  }
  
  // 3. Try to extract place name from standard google.com/maps/place/Name
  if (url.includes("maps/place/")) {
    try {
      const part = url.split("maps/place/")[1];
      if (part) {
        const placeEncoded = part.split("/")[0];
        const placeDecoded = decodeURIComponent(placeEncoded.replace(/\+/g, " "));
        if (placeDecoded) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(placeDecoded)}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 4. Try to extract query from google.com/maps?q=Name or &q=Name
  try {
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
    }
  } catch (e) {
    // Not a valid full URL
  }

  // 5. Fallback: clean the tour name to get the best search query
  let cleanQuery = tourName;
  // Remove common promotional/meta words in Vietnamese
  cleanQuery = cleanQuery.replace(/(Tour|Combo|Du lịch|Trọn gói|Giá rẻ|Khám phá|Hành trình|Nghỉ dưỡng|Cao cấp|Khách sạn|Vé máy bay)\s*/gi, "");
  // Remove day indicators like "3N2Đ", "2N1Đ", "4 Ngày", etc.
  cleanQuery = cleanQuery.replace(/\d+\s*(ngày|đêm|n|đ)\s*\d*\s*(ngày|đêm|n|đ)*/gi, "");
  // Replace hyphens and pipes with spaces and clean up
  cleanQuery = cleanQuery.replace(/[-|]/g, " ").replace(/\s+/g, " ").trim();
  
  // Combine with destination
  const searchAddress = cleanQuery + (destinationName ? `, ${destinationName}` : "");
  return `https://maps.google.com/maps?q=${encodeURIComponent(searchAddress)}&t=&z=16&hl=vi&ie=UTF8&iwloc=addr&output=embed`;
};

export const getDirectionsUrl = (mapUrl: string) => {
  if (!mapUrl) return "#";
  let url = mapUrl.trim();

  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }

  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordMatch[1]},${coordMatch[2]}`;
  }

  const qCoordMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qCoordMatch) {
    return `https://www.google.com/maps/dir/?api=1&destination=${qCoordMatch[1]},${qCoordMatch[2]}`;
  }

  if (url.includes("pb=")) {
    const pbMatch = url.match(/!3d(-?\d+\.\d+)!2d(-?\d+\.\d+)/) || url.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
    if (pbMatch) {
      if (url.includes("!3d" + pbMatch[1])) {
        return `https://www.google.com/maps/dir/?api=1&destination=${pbMatch[1]},${pbMatch[2]}`;
      } else {
        return `https://www.google.com/maps/dir/?api=1&destination=${pbMatch[2]},${pbMatch[1]}`;
      }
    }
  }

  return getCleanMapUrl(mapUrl);
};

export const getMapAddress = (mapUrl: string, fallback: string = "") => {
  if (!mapUrl) return fallback;
  let url = mapUrl.trim();

  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
  }

  if (url.includes("!2s")) {
    try {
      const part = url.split("!2s")[1];
      if (part) {
        const segment = part.split("!")[0].split("&")[0];
        const decoded = decodeURIComponent(segment.replace(/\+/g, " "));
        if (decoded && decoded.trim() && !decoded.includes("=") && decoded.length < 150) {
          return decoded.trim();
        }
      }
    } catch (e) {}
  }

  if (url.includes("maps/place/")) {
    try {
      const part = url.split("maps/place/")[1];
      if (part) {
        const placeEncoded = part.split("/")[0];
        const decoded = decodeURIComponent(placeEncoded.replace(/\+/g, " "));
        if (decoded && decoded.trim() && decoded.length < 150) {
          return decoded.trim();
        }
      }
    } catch (e) {}
  }

  try {
    if (url.includes("q=")) {
      const urlObj = new URL(url);
      const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
      if (q && q.trim() && q.length < 150) {
        return q.trim();
      }
    }
  } catch (e) {}

  return fallback;
};
