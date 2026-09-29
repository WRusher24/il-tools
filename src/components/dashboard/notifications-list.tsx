"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import type { Notification } from "@/db/schema";
import { timeAgo } from "@/lib/format";

export function NotificationsList({
  initial,
}: {
  initial: Notification[];
}) {
  const [items, setItems] = useState<Notification[]>(initial);

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.addEventListener("notification", (msg) => {
      try {
        const n = JSON.parse((msg as MessageEvent).data) as Notification;
        setItems((prev) =>
          prev.some((p) => p.id === n.id) ? prev : [n, ...prev].slice(0, 30),
        );
      } catch {
        /* malformed frame */
      }
    });
    return () => es.close();
  }, []);

  async function markAllRead() {
    setItems((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() })),
    );
    await fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
  }

  const hasUnread = items.some((n) => !n.readAt);

  return (
    <div className="card overflow-hidden" id="notifications">
      <div className="flex items-center justify-between p-5 border-b border-line">
        <h2 className="font-extrabold flex items-center gap-2">
          <BellRing size={17} className="text-accent" /> ההתראות שלי
        </h2>
        {hasUnread && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-semibold text-accent inline-flex items-center gap-1 hover:underline"
          >
            <CheckCheck size={13} /> סמן הכל כנקרא
          </button>
        )}
      </div>
      <ul className="divide-y divide-line max-h-105 overflow-y-auto">
        {items.map((n) => (
          <li
            key={n.id}
            className={`px-5 py-3.5 transition-colors ${
              n.readAt ? "opacity-65" : "bg-accent-soft/60"
            }`}
          >
            <p className="text-sm font-bold flex items-center gap-2">
              {!n.readAt && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" />
              )}
              {n.title}
            </p>
            <p className="text-sm text-muted-fg leading-snug mt-1">{n.body}</p>
            <p className="text-[11px] text-muted-fg mt-1.5">{timeAgo(n.createdAt)}</p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-5 py-10 text-center text-sm text-muted-fg">
            אין התראות עדיין — נעדכן אתכם כאן בזמן אמת.
          </li>
        )}
      </ul>
    </div>
  );
}
