const rawApiUrl = (process.env.NEXT_PUBLIC_BASE_API_URL || "").trim();
const defaultBaseUrl = "https://api-panel-bulky.astadigitalagency.com";

// Normalisasi URL agar fleksibel baik saat diisi dengan /api maupun tanpa /api,
// dan mencegah fallback kosong saat build-time Docker standalone.
const resolvedBaseUrl = (rawApiUrl || defaultBaseUrl)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export const baseUrlToko =
  process.env.NEXT_PUBLIC_BASE_URL_TOKO || "https://bulky.id";
export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://panel-bulky.astadigitalagency.com";
export const baseApiUrl = resolvedBaseUrl;
export const apiUrl = `${resolvedBaseUrl}/api/panel`;
export const cookiesKey =
  process.env.NEXT_PUBLIC_COOKIES_KEY || "ACCESS_TOKEN";
