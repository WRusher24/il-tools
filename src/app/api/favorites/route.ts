import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, tools } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { emitActivity, emitNotification } from "@/lib/events";
import { getUserFavoriteSlugs } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { favoriteSchema, firstIssue } from "@/lib/validation";

export const runtime = "nodejs";

async function resolveTool(slug: string) {
  const rows = await db
    .select()
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, slugs: await getUserFavoriteSlugs(user.id) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const rl = rateLimit(`fav:${user.id}:${clientIp(req)}`, 120, 10 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });

  const parsed = favoriteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstIssue(parsed.error) }, { status: 400 });
  }

  const tool = await resolveTool(parsed.data.slug);
  if (!tool) return NextResponse.json({ ok: false, error: "המערכת לא נמצאה" }, { status: 404 });

  await db
    .insert(favorites)
    .values({ userId: user.id, toolId: tool.id })
    .onConflictDoNothing();

  void emitActivity({
    type: "favorite_added",
    actorName: user.name,
    message: `שמר/ה את ${tool.name} למועדפים`,
    toolSlug: tool.slug,
  });
  void emitNotification(user.id, {
    type: "favorite",
    title: "נשמר למועדפים",
    body: `${tool.name} נוספה לרשימת ההשוואה האישית שלך.`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const parsed = favoriteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstIssue(parsed.error) }, { status: 400 });
  }

  const tool = await resolveTool(parsed.data.slug);
  if (!tool) return NextResponse.json({ ok: true });

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.toolId, tool.id)));

  return NextResponse.json({ ok: true });
}
