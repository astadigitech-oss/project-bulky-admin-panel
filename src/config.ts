export const baseUrlToko =
  process.env.NEXT_PUBLIC_BASE_URL_TOKO! ?? "http://localhost:3000";
export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL! ?? "http://localhost:3001";
export const baseApiUrl =
  process.env.NEXT_PUBLIC_BASE_API_URL! ?? "https://api.bulky.id";
export const apiUrl = `${baseApiUrl}/api/panel`;
export const cookiesKey = process.env.NEXT_PUBLIC_COOKIES_KEY!;
