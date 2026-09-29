import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { emitActivity, emitNotification } from "@/lib/events";
import { assembleUpload, deleteUploadDir, listChunkIndexes } from "@/lib/storage";
import { formatBytes } from "@/lib/format";

export const runtime = "nodejs";

/** Step 3: verify all parts arrived, merge, checksum, finalize. */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  const row = rows[0];
  if (!row || row.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }
  if (row.status === "completed") {
    return NextResponse.json({ ok: true, already: true, sha256: row.sha256 });
  }
  if (row.status !== "pending") {
    return NextResponse.json({ ok: false, error: "invalid-state" }, { status: 409 });
  }

  const received = await listChunkIndexes(row.id);
  if (received.length !== row.totalChunks) {
    return NextResponse.json(
      {
        ok: false,
        error: `חסרים ${row.totalChunks - received.length} צ'אנקים להשלמת ההעלאה`,
        missing: row.totalChunks - received.length,
      },
      { status: 409 },
    );
  }

  try {
    const { sha256, size } = await assembleUpload(row.id, row.totalChunks);
    await db
      .update(uploads)
      .set({
        status: "completed",
        sha256,
        sizeBytes: size,
        completedAt: new Date(),
      })
      .where(eq(uploads.id, row.id));

    await Promise.all([
      emitNotification(user.id, {
        type: "upload",
        title: "ההעלאה הושלמה",
        body: `${row.fileName} (${formatBytes(size)}) הועלה ואומת בהצלחה.`,
      }),
      emitActivity({
        type: "upload_completed",
        actorName: user.name,
        message: `העלה/תה קובץ: ${row.fileName}`,
      }),
    ]);

    return NextResponse.json({ ok: true, sha256, size });
  } catch (err) {
    console.error("[uploads] assemble failed:", err);
    await db
      .update(uploads)
      .set({ status: "failed" })
      .where(eq(uploads.id, row.id));
    await deleteUploadDir(row.id);
    return NextResponse.json(
      { ok: false, error: "איחוד הקובץ נכשל. נסו להעלות מחדש." },
      { status: 500 },
    );
  }
}
