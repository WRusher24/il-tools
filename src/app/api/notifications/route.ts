import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { getUnreadCount, getUserNotifications } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const [items, unread] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadCount(user.id),
  ]);
  return NextResponse.json({ ok: true, items, unread });
}

/** Mark every unread notification as read. */
export async function PATCH() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

  return NextResponse.json({ ok: true });
}
