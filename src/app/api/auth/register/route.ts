import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/passwords";
import { applySessionCookie, createSession } from "@/lib/auth";
import { emitActivity, emitNotification } from "@/lib/events";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { firstIssue, registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`register:${clientIp(req)}`, 8, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "יותר מדי ניסיונות. נסו שוב בעוד שעה." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstIssue(parsed.error) },
      { status: 400 },
    );
  }
  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "כתובת האימייל כבר רשומה במערכת" },
      { status: 409 },
    );
  }

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .returning();

  const { token, expiresAt } = await createSession(user.id);

  await Promise.all([
    emitNotification(user.id, {
      type: "welcome",
      title: "ברוכים הבאים ל־il-tools",
      body: "החשבון נפתח בהצלחה. התחילו לשמור מערכות מועדפות וקבלו עדכונים בזמן אמת.",
    }),
    emitActivity({
      type: "user_joined",
      actorName: user.name,
      message: `הצטרף/ה ל־il-tools`,
    }),
  ]);

  const res = NextResponse.json({ ok: true });
  applySessionCookie(res, token, expiresAt);
  return res;
}
