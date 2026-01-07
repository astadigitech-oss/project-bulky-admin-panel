"use server";

import { cookies } from "next/headers";
import { apiUrl, cookiesKey } from "@/config";

export async function auth() {
  const cookie = await cookies();
  const token = cookie.get(cookiesKey)?.value;
  try {
    const res = await fetch(`${apiUrl}/auth/check`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.log("ERROR_CHECK", error);
    return false;
  }
}
