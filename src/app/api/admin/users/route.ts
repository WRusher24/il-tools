import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { emitActivity, emitNotification } from "@/lib/events";
import { adminRoleSchema, firstIssue } from "@/lib/validation";

export const runtime = "nodejs";

/** Admin-only RBAC management: change a user's role. */
export async function PATCH(req: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || !can(admin, "adminConsole")) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const parsed = adminRoleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { userId, role } = parsed.data;

  if (userId === admin.id) {
    return NextResponse.json(
      { ok: false, error: "לא ניתן לשנות את התפקיד של עצמכם" },
      { status: 400 },
    );
  }

  const target = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (target.length === 0) {
    return NextResponse.json({ ok: false, error: "המשתמש לא נמצא" }, { status: 404 });
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));

  await Promise.all([
    emitNotification(userId, {
      type: "role",
      title: "התפקיד שלך עודכן",
      body: `המסלול שלך שונה ל־${ROLE_LABELS[role]}. היכנסי/ה מחדש לראות את ההטבות המעודכנות.`,
    }),
    emitActivity({
      type: "role_changed",
      actorName: admin.name,
      message: `החליף/ה תפקיד ל־${target[0].name}: ${ROLE_LABELS[role]}`,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
