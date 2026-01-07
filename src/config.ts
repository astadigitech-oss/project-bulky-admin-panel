export const baseApiUrl =
  process.env.NEXT_PUBLIC_BASE_API_URL! ?? "http://localhost:3000";
export const apiUrl = `${baseApiUrl}/api/panel`;
export const cookiesKey = process.env.NEXT_PUBLIC_COOKIES_KEY! ?? "secret";
