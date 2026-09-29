import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  destroySessionByToken,
  getSessionToken,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await destroySessionByToken(token).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
