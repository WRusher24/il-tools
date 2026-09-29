import { NextResponse } from "next/server";
import { getAllTools } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public catalog feed — the living replacement for the legacy
 * `public/tools.json` static export (kept reachable at /tools.json via
 * a permanent redirect).
 */
export async function GET() {
  const rows = await getAllTools();
  return NextResponse.json(
    rows.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      target: t.target,
      startingPriceIls: t.startingPriceIls,
      freeTierAvailable: t.freeTierAvailable,
      hasMobileApp: t.hasMobileApp,
      ecommerceIntegration: t.ecommerceIntegration,
      hebrewSupport: t.hebrewSupport,
      hasApi: t.hasApi,
      israelVatSupport: t.israelVatSupport,
      description: t.description,
    })),
    { headers: { "cache-control": "public, max-age=60" } },
  );
}
