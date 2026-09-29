import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import type { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { newSessionToken, sha256Hex } from "@/lib/passwords";

export const SESSION_COOKIE = "it_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days, absolute

/** Create a session row; the raw token is only ever returned, never stored. */
export async function createSession(userId: string) {
  const token = newSessionToken();
  const id = sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { token, expiresAt };
}

export async function destroySessionByToken(token: string) {
  await db.delete(sessions).where(eq(sessions.id, sha256Hex(token)));
}

/** Resolve the current request's user from the session cookie. */
export async function getSessionUser(): Promise<User | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({ user: users, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(eq(sessions.id, sha256Hex(token)), gt(sessions.expiresAt, new Date())),
      )
      .limit(1);
    return rows[0]?.user ?? null;
  } catch {
    // DB not reachable yet (e.g. pre-seed) — render logged-out state.
    return null;
  }
}

/** Read the raw bearer token from the request cookie (route handlers). */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/** Attach the hardened session cookie to a response. */
export function applySessionCookie(
  res: NextResponse,
  token: string,
  expiresAt: Date,
) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JS (XSS exfiltration guard)
    sameSite: "lax", // CSRF baseline (defense-in-depth w/ origin checks)
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Clear the session cookie (logout). */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Periodic hygiene — delete expired sessions. */
export async function pruneExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
