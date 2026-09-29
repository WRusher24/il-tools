import { db } from "@/db";
import {
  activityEvents,
  notifications,
  type ActivityEvent,
  type Notification,
} from "@/db/schema";

/**
 * Real-time event bus.
 *
 * Producers (auth, uploads, tracking) call `emitActivity` / `emitNotification`
 * which persist the row (durable history) and synchronously fan out to every
 * subscriber (live SSE streams in `app/api/stream`). A ring buffer keeps the
 * last events so brand-new streams get instant context without a DB round-trip.
 */

export type BusEvent =
  | { kind: "activity"; payload: ActivityEvent }
  | { kind: "notification"; payload: Notification };

type Subscriber = (event: BusEvent) => void;

interface BusState {
  subs: Set<Subscriber>;
  recentActivity: ActivityEvent[];
}

const globalForBus = globalThis as typeof globalThis & {
  __ilToolsEventBus?: BusState;
};

const bus: BusState = (globalForBus.__ilToolsEventBus ??= {
  subs: new Set(),
  recentActivity: [],
});

const RING_SIZE = 50;

export function subscribe(fn: Subscriber): () => void {
  bus.subs.add(fn);
  return () => {
    bus.subs.delete(fn);
  };
}

export function recentActivityBuffer(): ActivityEvent[] {
  return [...bus.recentActivity];
}

function publish(event: BusEvent) {
  if (event.kind === "activity") {
    bus.recentActivity = [event.payload, ...bus.recentActivity].slice(
      0,
      RING_SIZE,
    );
  }
  for (const fn of bus.subs) {
    try {
      fn(event);
    } catch {
      // Never let one broken stream take down the bus.
    }
  }
}

export async function emitActivity(input: {
  type: string;
  actorName: string;
  message: string;
  toolSlug?: string | null;
}): Promise<ActivityEvent | null> {
  try {
    const [row] = await db
      .insert(activityEvents)
      .values({
        type: input.type,
        actorName: input.actorName,
        message: input.message,
        toolSlug: input.toolSlug ?? null,
      })
      .returning();
    publish({ kind: "activity", payload: row });
    return row;
  } catch (err) {
    console.error("[events] emitActivity failed:", err);
    return null;
  }
}

export async function emitNotification(
  userId: string,
  input: { type: string; title: string; body: string },
): Promise<Notification | null> {
  try {
    const [row] = await db
      .insert(notifications)
      .values({ userId, type: input.type, title: input.title, body: input.body })
      .returning();
    publish({ kind: "notification", payload: row });
    return row;
  } catch (err) {
    console.error("[events] emitNotification failed:", err);
    return null;
  }
}
