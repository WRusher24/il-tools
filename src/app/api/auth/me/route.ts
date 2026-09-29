import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: true, user: null });
  }
  const unread = await getUnreadCount(user.id);
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    unread,
  });
}
