const rawApiUrl = (process.env.NEXT_PUBLIC_BASE_API_URL || "").trim();
const defaultBaseUrl = "https://api.bulky.id";

// Normalisasi URL agar fleksibel baik saat diisi dengan /api maupun tanpa /api,
// dan mencegah fallback kosong saat build-time Docker standalone.
const resolvedBaseUrl = (rawApiUrl || defaultBaseUrl)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export const baseUrlToko =
  process.env.NEXT_PUBLIC_BASE_URL_TOKO || "http://localhost:3000";
export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
export const baseApiUrl = resolvedBaseUrl;
export const apiUrl = `${resolvedBaseUrl}/api/panel`;
export const cookiesKey =
  process.env.NEXT_PUBLIC_COOKIES_KEY || "ACCESS_TOKEN";
