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
