"use client";

import { useEffect, useState } from "react";
import { Activity, Radio } from "lucide-react";
import type { ActivityEvent } from "@/db/schema";
import { timeAgo } from "@/lib/format";

/**
 * Live activity feed. Initial rows arrive from SSR; everything after that is
 * pushed over SSE and merged client-side (deduped by id).
 */
export function ActivityFeed({ initial }: { initial: ActivityEvent[] }) {
  const [events, setEvents] = useState<ActivityEvent[]>(initial);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);
    es.addEventListener("activity", (msg) => {
      try {
        const ev = JSON.parse((msg as MessageEvent).data) as ActivityEvent;
        setEvents((prev) => {
          if (prev.some((e) => e.id === ev.id)) return prev;
          return [ev, ...prev].slice(0, 30);
        });
      } catch {
        /* malformed frame */
      }
    });
    return () => es.close();
  }, []);

  return (
    <div className="card overflow-hidden h-full">
      <div className="flex items-center justify-between p-5 border-b border-line">
        <h2 className="font-extrabold flex items-center gap-2">
          <Activity size={17} className="text-accent" /> פעילות חיה בפלטפורמה
        </h2>
        <span className="chip !text-[11px] !py-1">
          {live ? (
            <>
              <span className="live-dot" /> מחובר
            </>
          ) : (
            <>
              <Radio size={11} /> מתחבר…
            </>
          )}
        </span>
      </div>
      <ul className="divide-y divide-line max-h-105 overflow-y-auto">
        {events.map((ev) => (
          <li key={ev.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-cream transition-colors">
            <span className="mt-1 flex-none w-2 h-2 rounded-full bg-accent/60" />
            <div className="min-w-0">
              <p className="text-sm leading-snug">
                <b>{ev.actorName}</b> {ev.message}
              </p>
              <p className="text-[11px] text-muted-fg mt-1">
                {timeAgo(ev.createdAt)} · {ev.type}
              </p>
            </div>
          </li>
        ))}
        {events.length === 0 && (
          <li className="px-5 py-10 text-center text-sm text-muted-fg">
            עדיין אין פעילות להצגה.
          </li>
        )}
      </ul>
    </div>
  );
}
