import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { CHUNK_SIZE, listChunkIndexes, writeChunk } from "@/lib/storage";
import { chunkIndexSchema } from "@/lib/validation";

export const runtime = "nodejs";

/** Step 2: receive one binary chunk (idempotent per index → safe retries). */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const rl = rateLimit(`upload-chunk:${user.id}:${clientIp(req)}`, 900, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  const row = rows[0];
  if (!row || row.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }
  if (row.status !== "pending") {
    return NextResponse.json(
      { ok: false, error: "ההעלאה כבר הושלמה או בוטלה" },
      { status: 409 },
    );
  }

  const idxParsed = chunkIndexSchema.safeParse(
    req.nextUrl.searchParams.get("index") ?? "",
  );
  if (!idxParsed.success || idxParsed.data >= row.totalChunks) {
    return NextResponse.json({ ok: false, error: "אינדקס צ'אנק לא תקין" }, { status: 400 });
  }
  const index = idxParsed.data;

  const body = Buffer.from(await req.arrayBuffer());
  if (body.length === 0 || body.length > CHUNK_SIZE) {
    return NextResponse.json(
      { ok: false, error: `גודל צ'אנק חייב להיות 1–${CHUNK_SIZE} בתים` },
      { status: 400 },
    );
  }

  await writeChunk(row.id, index, body);

  // On-disk listing is the source of truth → resume + double-send safe.
  const received = await listChunkIndexes(row.id);
  if (received.length !== row.receivedChunks) {
    await db
      .update(uploads)
      .set({ receivedChunks: received.length })
      .where(eq(uploads.id, row.id));
  }

  return NextResponse.json({
    ok: true,
    index,
    received: received.length,
    totalChunks: row.totalChunks,
    complete: received.length >= row.totalChunks,
  });
}
