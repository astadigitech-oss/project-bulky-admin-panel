const rawApiUrl = (
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.BASE_API_URL ||
  ""
).trim();

// Normalisasi URL agar fleksibel baik saat diisi dengan /api maupun tanpa /api.
const resolvedBaseUrl = rawApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export const baseUrlToko =
  process.env.NEXT_PUBLIC_BASE_URL_TOKO || "https://bulky.id";
export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "";
export const baseApiUrl = resolvedBaseUrl;
export const apiUrl = resolvedBaseUrl ? `${resolvedBaseUrl}/api/panel` : "/api/panel";
export const cookiesKey =
  process.env.NEXT_PUBLIC_COOKIES_KEY || "ACCESS_TOKEN";

