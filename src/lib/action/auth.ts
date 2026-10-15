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

export async function getAuthPermissions(): Promise<string[] | null> {
  const cookie = await cookies();
  const token = cookie.get(cookiesKey)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const response = (await res.json()) as {
      data?: { permissions?: unknown };
    };
    const permissions = response.data?.permissions;
    if (
      !Array.isArray(permissions) ||
      !permissions.every((permission): permission is string => typeof permission === "string")
    ) {
      return null;
    }

    return permissions;
  } catch (error) {
    console.log("ERROR_GET_AUTH_PERMISSIONS", error);
    return null;
  }
}
