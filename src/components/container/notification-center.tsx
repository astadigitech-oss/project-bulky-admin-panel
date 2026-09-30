"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next/client";
import { Bell, BellRing, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { apiUrl, cookiesKey } from "@/config";
import { isAdminWebPushConfigured, registerCurrentAdminWebPush } from "@/lib/firebase/push-client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

type AdminNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  is_read: boolean;
  created_at: string;
};

type ListResponse = {
  data?: {
    notifications?: AdminNotification[];
    unread_count?: number;
  };
};

function authorizationHeaders(): Record<string, string> {
  const token = getCookie(cookiesKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function internalTarget(deepLink?: string) {
  if (deepLink?.startsWith("/") && !deepLink.startsWith("//")) return deepLink;
  return "/orders/list";
}

export function NotificationCenter({ canReadOrders }: { canReadOrders: boolean }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [pushConfigured, setPushConfigured] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!canReadOrders) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/notifications`, {
        headers: authorizationHeaders(),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as ListResponse;
      setNotifications(result.data?.notifications ?? []);
      setUnreadCount(result.data?.unread_count ?? 0);
    } catch {
      // Keep the bell usable if the notifications endpoint is temporarily unavailable.
    } finally {
      setIsLoading(false);
    }
  }, [canReadOrders]);

  useEffect(() => {
    if (!canReadOrders) return;
    setPushConfigured(isAdminWebPushConfigured());
    setPushSupported(typeof Notification !== "undefined");
    setPushEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
    void loadNotifications();
    const poll = window.setInterval(() => void loadNotifications(), 30_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void loadNotifications();
    };
    const onPush = (event: Event) => {
      void loadNotifications();
      const payload = (event as CustomEvent<{
        notification?: { title?: string; body?: string };
        data?: { deep_link?: string };
      }>).detail;
      toast(payload.notification?.title ?? "Pesanan baru masuk", {
        description: payload.notification?.body,
        action: {
          label: "Lihat pesanan",
          onClick: () => router.push(internalTarget(payload.data?.deep_link)),
        },
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("bulky:admin-push-message", onPush);
    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("bulky:admin-push-message", onPush);
    };
  }, [canReadOrders, loadNotifications, router]);

  useEffect(() => {
    if (!canReadOrders || !pushConfigured || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    void registerCurrentAdminWebPush().then(setPushEnabled).catch(() => setPushEnabled(false));
  }, [canReadOrders, pushConfigured]);

  async function enablePush() {
    if (typeof Notification === "undefined") return;
    setIsEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info("Izin notifikasi belum diberikan.");
        return;
      }
      const registered = await registerCurrentAdminWebPush();
      setPushEnabled(registered);
      if (registered) toast.success("Notifikasi pesanan diaktifkan di browser ini.");
      else toast.error("Push notification tidak didukung atau konfigurasi Firebase belum lengkap.");
    } catch {
      toast.error("Gagal mengaktifkan push notification.");
    } finally {
      setIsEnabling(false);
    }
  }

  async function openNotification(item: AdminNotification) {
    if (!item.is_read) {
      setNotifications((current) => current.map((row) => row.id === item.id ? { ...row, is_read: true } : row));
      setUnreadCount((current) => Math.max(0, current - 1));
      try {
        await fetch(`${apiUrl}/notifications/${encodeURIComponent(item.id)}/read`, {
          method: "PATCH",
          headers: authorizationHeaders(),
        });
      } catch {
        // Navigation should not depend on the read receipt request.
      }
    }
    router.push(internalTarget(item.data?.deep_link));
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={!canReadOrders}
        render={
          <Button size="icon" variant="outline" className="relative rounded-full">
            <Bell />
            {canReadOrders && unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
            <span className="sr-only">Pemberitahuan pesanan</span>
          </Button>
        }
      />
      <PopoverContent
        sideOffset={27}
        align="end"
        alignOffset={-45}
        className="flex h-[min(70vh,36rem)] w-[min(24rem,calc(100vw-2rem))] flex-col p-0"
      >
        <PopoverHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <PopoverTitle>Pemberitahuan</PopoverTitle>
            <p className="mt-1 text-xs text-muted-foreground">Pesanan baru yang menunggu diproses</p>
          </div>
          {pushConfigured && pushSupported && canReadOrders ? (
            <Button size="sm" variant={pushEnabled ? "secondary" : "outline"} onClick={() => void enablePush()} disabled={pushEnabled || isEnabling}>
              {isEnabling ? <Loader2 className="size-4 animate-spin" /> : pushEnabled ? <Check className="size-4" /> : <BellRing className="size-4" />}
              {pushEnabled ? "Aktif" : "Aktifkan push"}
            </Button>
          ) : null}
        </PopoverHeader>
        {!canReadOrders ? (
          <p className="p-5 text-sm text-muted-foreground">Akun ini tidak memiliki akses untuk melihat pesanan.</p>
        ) : isLoading && notifications.length === 0 ? (
          <div className="grid flex-1 place-items-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
        ) : notifications.length === 0 ? (
          <div className="grid flex-1 place-items-center px-5 text-center text-sm text-muted-foreground">Belum ada pesanan baru.</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {notifications.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => void openNotification(item)}
                className={`w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/60 ${item.is_read ? "" : "bg-amber-50/70 dark:bg-amber-950/20"}`}
              >
                <span className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.is_read ? "bg-transparent" : "bg-amber-500"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.body}</span>
                    <time className="mt-2 block text-[11px] text-muted-foreground" dateTime={item.created_at}>
                      {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}
                    </time>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
