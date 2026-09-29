import { NextRequest, NextResponse } from "next/server";
import { getToolBySlug } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { emitActivity } from "@/lib/events";

export const runtime = "nodejs";

/**
 * Affiliate redirect gateway: one hop that records the outbound click in the
 * activity stream, then 302s to the partner site. Redirect target is always
 * read from the DB (never from user input) → no open-redirect surface.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) {
    return NextResponse.redirect(new URL("/", _req.url));
  }
  const tool = await getToolBySlug(slug);
  if (!tool) return NextResponse.redirect(new URL("/", _req.url));

  const user = await getSessionUser();
  void emitActivity({
    type: "affiliate_click",
    actorName: user?.name ?? "אורח",
    message: `עבר/ה לאתר הרשמי של ${tool.name}`,
    toolSlug: tool.slug,
  });

  const target = new URL(tool.affiliateLink);
  if (!["https:", "http:"].includes(target.protocol)) {
    return NextResponse.redirect(new URL("/", _req.url));
  }
  return NextResponse.redirect(target);
}
