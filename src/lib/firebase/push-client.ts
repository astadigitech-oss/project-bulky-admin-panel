import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  onMessage,
  onRegistered,
  onUnregistered,
  register,
  unregister,
  type Messaging,
} from "firebase/messaging";
import { apiUrl, cookiesKey } from "@/config";
import { getCookie } from "cookies-next/client";

const fidStorageKey = "bulky.admin.push.fid.v1";

function firebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

export function isAdminWebPushConfigured() {
  const config = firebaseConfig();
  return Boolean(
    config.apiKey &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  );
}

async function messagingClient(): Promise<Messaging | null> {
  if (!(await isSupported()) || !isAdminWebPushConfigured()) return null;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig());
  return getMessaging(app);
}

async function saveFID(fid: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(fidStorageKey, fid);
  try {
    const token = getCookie(cookiesKey);
    const response = await fetch(`${apiUrl}/notifications/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fid }),
    });
    if (!response.ok) console.warn("Could not register this admin push device.");
  } catch {
    console.warn("Could not reach Bulky while registering this admin push device.");
  }
}

async function removeFID(fid: string) {
  if (!fid || typeof window === "undefined") return;
  if (window.localStorage.getItem(fidStorageKey) === fid) {
    window.localStorage.removeItem(fidStorageKey);
  }
  try {
    const token = getCookie(cookiesKey);
    await fetch(`${apiUrl}/notifications/devices`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fid }),
    });
  } catch {
    // Logout should proceed even if the backend cannot be reached.
  }
}

let listenersReady = false;
function attachMessagingListeners(messaging: Messaging) {
  if (listenersReady) return;
  listenersReady = true;
  onRegistered(messaging, (fid) => void saveFID(fid));
  onUnregistered(messaging, (fid) => void removeFID(fid));
  onMessage(messaging, (payload) => {
    window.dispatchEvent(new CustomEvent("bulky:admin-push-message", { detail: payload }));
  });
}

export async function registerCurrentAdminWebPush() {
  const messaging = await messagingClient();
  if (!messaging || !("serviceWorker" in navigator)) return false;
  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/", updateViaCache: "none" },
  );
  attachMessagingListeners(messaging);
  await register(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });
  return true;
}

export async function unregisterCurrentAdminWebPush() {
  if (typeof window === "undefined") return;
  const fid = window.localStorage.getItem(fidStorageKey);
  if (fid) await removeFID(fid);
  try {
    const messaging = await messagingClient();
    if (messaging) await unregister(messaging);
  } catch {
    // Logout must proceed even if the browser cannot contact FCM.
  }
}
