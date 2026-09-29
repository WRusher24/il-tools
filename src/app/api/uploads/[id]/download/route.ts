import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { readFinal } from "@/lib/storage";

export const runtime = "nodejs";

/** Owner-or-admin download of an assembled upload. */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  const row = rows[0];
  if (!row || (row.userId !== user.id && user.role !== "admin")) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }
  if (row.status !== "completed") {
    return NextResponse.json({ ok: false, error: "not-ready" }, { status: 409 });
  }

  const file = await readFinal(row.id);
  if (!file) return NextResponse.json({ ok: false, error: "object-missing" }, { status: 410 });

  const utf8Name = encodeURIComponent(row.fileName);
  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "content-type": row.mimeType,
      "content-length": String(file.size),
      "content-disposition": `attachment; filename="download"; filename*=UTF-8''${utf8Name}`,
      "x-sha256": row.sha256 ?? "",
      "cache-control": "private, no-store",
    },
  });
}
