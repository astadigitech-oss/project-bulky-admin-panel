import "server-only";

import { cookies } from "next/headers";
import { baseApiUrl } from "@/config";

export const auth = async () => {
  const cookie = await cookies();
  const token = cookie.get("accessToken")?.value;
  try {
    const res = await fetch(`${baseApiUrl}/checkLogin`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (cookie.has("accessToken")) {
        cookie.delete("profile");
        cookie.delete("accessToken");
      }
      return false;
    }

    return true;
  } catch (error) {
    console.log("ERROR_CHECK", error);
    return false;
  }
};
