"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

/**
 * Live notification bell: hydrates the unread count from REST, then keeps it
 * in sync over the SSE channel (no polling).
 */
export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [unread, setUnread] = useState(initialUnread);
  const [flash, setFlash] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.addEventListener("notification", () => {
      setUnread((n) => n + 1);
      setFlash(true);
      setTimeout(() => setFlash(false), 1600);
    });
    return () => es.close();
  }, []);

  async function open() {
    if (unread > 0) {
      setUnread(0);
      fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
    }
    router.push("/dashboard#notifications");
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`התראות (${unread} שלא נקראו)`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
        flash ? "bg-teal/25 text-teal" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Bell size={17} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}
