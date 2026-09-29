import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { countActiveUploads } from "@/lib/data";
import { maxActiveUploads } from "@/lib/rbac";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { CHUNK_SIZE, prepareUpload } from "@/lib/storage";
import { firstIssue, initiateUploadSchema } from "@/lib/validation";

export const runtime = "nodejs";

/** Step 1 of the resumable-upload protocol: register intent, get an id. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const rl = rateLimit(`upload-init:${user.id}:${clientIp(req)}`, 30, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "יותר מדי בקשות העלאה. נסו שוב מאוחר יותר." },
      { status: 429 },
    );
  }

  const parsed = initiateUploadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { fileName, mimeType, sizeBytes, totalChunks } = parsed.data;

  // RBAC quota: active (pending) uploads per role.
  const active = await countActiveUploads(user.id);
  const quota = maxActiveUploads(user);
  if (active >= quota) {
    return NextResponse.json(
      {
        ok: false,
        error: `הגעתם למכסת ההעלאות הפעילות (${quota}). השלימו העלאה קיימת או שדרגו לפרימיום.`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 403 },
    );
  }

  const [row] = await db
    .insert(uploads)
    .values({ userId: user.id, fileName, mimeType, sizeBytes, totalChunks })
    .returning({ id: uploads.id });

  await prepareUpload(row.id);

  return NextResponse.json({
    ok: true,
    uploadId: row.id,
    chunkSize: CHUNK_SIZE,
    quota: { active: active + 1, max: quota },
  });
}
