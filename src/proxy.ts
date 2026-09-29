import { NextRequest, NextResponse } from "next/server";

/**
 * Edge request boundary (Next 16 `proxy` convention):
 *  1. CSRF enforcement — every state-changing API call must be same-origin.
 *     (Combined with SameSite=Lax session cookies → double-layer defense.)
 *  2. Security response headers applied to every page and API response.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function forbidden(reason: string) {
  return NextResponse.json(
    { ok: false, error: "הבקשה נדחתה מטעמי אבטחה", reason },
    { status: 403 },
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    const fetchSite = req.headers.get("sec-fetch-site");

    if (origin && host) {
      try {
        if (new URL(origin).host !== host) return forbidden("origin-mismatch");
      } catch {
        return forbidden("origin-malformed");
      }
    } else if (fetchSite === "cross-site") {
      return forbidden("cross-site");
    }
  }

  const res = NextResponse.next();

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      // Next runtime requires inline scripts; nonce-based CSP is the
      // documented upgrade path when a stricter posture is needed.
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  );

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
