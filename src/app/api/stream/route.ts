import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { recentActivityBuffer, subscribe, type BusEvent } from "@/lib/events";
import { getRecentActivity } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function sse(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Real-time channel (SSE): streams the public activity feed to everyone and
 * personal notifications to the authenticated subscriber. Long-lived HTTP —
 * the WebSocket-equivalent that traverses proxies cleanly.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();

  const initial = recentActivityBuffer();
  const backlog = initial.length > 0 ? initial : await getRecentActivity(15);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 3000\n\n"));
      controller.enqueue(sse("hello", { ok: true, authed: Boolean(user) }));
      for (const ev of backlog) controller.enqueue(sse("activity", ev));

      const unsubscribe = subscribe((event: BusEvent) => {
        if (event.kind === "notification") {
          if (!user || event.payload.userId !== user.id) return;
        }
        try {
          controller.enqueue(sse(event.kind, event.payload));
        } catch {
          /* stream closed */
        }
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": hb\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
