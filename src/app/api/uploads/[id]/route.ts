import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { deleteUploadDir, listChunkIndexes } from "@/lib/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function getOwnedUpload(id: string, userId: string, isAdmin: boolean) {
  const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.userId !== userId && !isAdmin) return null;
  return row;
}

/** Progress-tracking endpoint: ground truth for resume after disconnect. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const row = await getOwnedUpload(id, user.id, user.role === "admin");
  if (!row) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });

  const received = row.status === "pending" ? await listChunkIndexes(row.id) : [];
  return NextResponse.json({
    ok: true,
    upload: {
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      totalChunks: row.totalChunks,
      status: row.status,
      sha256: row.sha256,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    },
    receivedIndexes: received,
    progress: Math.min(1, received.length / Math.max(1, row.totalChunks)),
  });
}

/** Cancel / delete an upload and purge its object storage. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const row = await getOwnedUpload(id, user.id, user.role === "admin");
  if (!row) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });

  await deleteUploadDir(row.id);
  await db.delete(uploads).where(eq(uploads.id, row.id));
  return NextResponse.json({ ok: true });
}
