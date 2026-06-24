import { NextResponse, type NextRequest } from "next/server";

// Workaround for a Payload admin + Next.js routing interaction: under Next's
// RSC/navigation request classification, the admin catch-all route
// ([[...segments]]) resolves to a 404 for authenticated, same-origin navigations
// — e.g. the redirect right after login, which the browser sends with
// `Sec-Fetch-Site: same-origin`. Stripping the Sec-Fetch-* hints for /admin
// requests forces the dashboard to render (HTTP 200). Scoped to /admin only, so
// the guest experience is untouched.
//
// Next 16 renamed the `middleware` file convention to `proxy`; this is that file.
export function proxy(request: NextRequest) {
  // Because this proxy matches /admin/:path* and returns NextResponse.next(),
  // it suppresses Next's built-in trailing-slash normalization. Without that,
  // `/admin/` reaches Payload's catch-all ([[...segments]]) as segments:[""]
  // instead of [] — which Payload treats as an unknown route and bounces to
  // login, producing a post-login redirect loop (login -> /admin/ -> login).
  // Restore the normalization ourselves before continuing.
  const { pathname } = request.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }

  // Only strip the Sec-Fetch-* hints for full-page (document) navigations —
  // that's the case where the authenticated admin catch-all 404s. RSC/data
  // navigations carry the `RSC` header; stripping their Sec-Fetch hints makes
  // Payload's auth check misfire and bounce an authenticated user back to
  // login, which is what turned the original 404 into a post-login redirect
  // loop. Leave RSC requests untouched.
  if (request.headers.get("rsc")) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.delete("sec-fetch-site");
  headers.delete("sec-fetch-mode");
  headers.delete("sec-fetch-dest");
  headers.delete("sec-fetch-user");
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
