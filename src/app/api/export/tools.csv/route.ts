import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllTools } from "@/lib/data";
import { can } from "@/lib/rbac";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function csvCell(value: string | number | boolean): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

/** Premium capability: full dataset export. */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!can(user, "exportDataset")) {
    return NextResponse.json(
      { ok: false, error: "ייצוא הנתונים זמין במסלול פרימיום בלבד", code: "PREMIUM_ONLY" },
      { status: 402 },
    );
  }
  const rl = rateLimit(`export:${user.id}:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });

  const rows = await getAllTools();
  const header = [
    "Slug",
    "Name",
    "Category",
    "Target",
    "Starting Price ILS",
    "Free Tier Available",
    "Has Mobile App",
    "E-Commerce Integration",
    "Hebrew Support",
    "Has API",
    "Israel VAT Support",
    "Affiliate Link",
    "Description",
  ];
  const lines = [
    header.join(","),
    ...rows.map((t) =>
      [
        t.slug,
        t.name,
        t.category,
        t.target,
        t.startingPriceIls,
        t.freeTierAvailable,
        t.hasMobileApp,
        t.ecommerceIntegration,
        t.hebrewSupport,
        t.hasApi,
        t.israelVatSupport,
        t.affiliateLink,
        t.description,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  // BOM prefix so Excel reads the Hebrew UTF-8 correctly.
  const body = "\uFEFF" + lines.join("\n");

  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="il-tools-dataset.csv"',
      "cache-control": "private, no-store",
    },
  });
}
