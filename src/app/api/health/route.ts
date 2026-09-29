import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus: "up" | "down" = "up";
  try {
    await db.execute(sql`select 1`);
  } catch {
    dbStatus = "down";
  }
  return NextResponse.json({
    ok: true,
    db: dbStatus,
    time: new Date().toISOString(),
  });
}
