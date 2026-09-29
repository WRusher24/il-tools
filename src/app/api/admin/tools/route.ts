import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { emitActivity } from "@/lib/events";
import { adminToolSchema, firstIssue } from "@/lib/validation";

export const runtime = "nodejs";

/** Admin-only catalog management: inline edit of tool attributes. */
export async function PATCH(req: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || !can(admin, "adminConsole")) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const parsed = adminToolSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { slug, ...patch } = parsed.data;

  const existing = await db
    .select({ id: tools.id, name: tools.name })
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ ok: false, error: "המערכת לא נמצאה" }, { status: 404 });
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "לא סופקו שדות לעדכון" }, { status: 400 });
  }

  await db.update(tools).set(patch).where(eq(tools.slug, slug));

  void emitActivity({
    type: "tool_updated",
    actorName: admin.name,
    message: `עדכן/ה נתוני קטלוג עבור ${existing[0].name}`,
    toolSlug: slug,
  });

  return NextResponse.json({ ok: true });
}
