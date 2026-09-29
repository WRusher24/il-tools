import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/passwords";
import {
  applySessionCookie,
  createSession,
  pruneExpiredSessions,
} from "@/lib/auth";
import { emitActivity } from "@/lib/events";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { firstIssue, loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

const GENERIC_ERROR = "אימייל או סיסמה שגויים";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "יותר מדי ניסיונות התחברות. נסו שוב בעוד מספר דקות." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstIssue(parsed.error) },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];

  // Uniform response for unknown email / wrong password (no enumeration).
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
  }

  if (Math.random() < 0.1) void pruneExpiredSessions().catch(() => {});

  const { token, expiresAt } = await createSession(user.id);
  void emitActivity({
    type: "user_login",
    actorName: user.name,
    message: "התחבר/ה לחשבון",
  });

  const res = NextResponse.json({ ok: true });
  applySessionCookie(res, token, expiresAt);
  return res;
}
