import { NextResponse, type NextRequest } from "next/server";

/**
 * Wildcard-subdomain tenancy.
 *
 * `bilal-sara.mydomain.com/sara-hassan` is rewritten to the internal route
 * `/w/bilal-sara/sara-hassan`. The same route also serves the path form
 * `/w/bilal-sara/sara-hassan` directly, which is what local development uses.
 *
 * (Next.js treats `_w` as a private, unroutable folder, so the internal prefix
 * is `w` rather than `_w`.)
 */

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "super",
  "api",
  "assets",
  "static",
  "uploads",
]);

const BYPASS_PREFIXES = ["/_next", "/api", "/w/", "/preview", "/admin", "/super", "/uploads"];

function hostWithoutPort(host: string): string {
  return host.split(":")[0].toLowerCase();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/w") return NextResponse.next();

  if (
    BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const rootHost = hostWithoutPort(process.env.APP_ROOT_DOMAIN ?? "localhost:3000");
  const host = hostWithoutPort(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "",
  );

  if (!rootHost || !host.endsWith(`.${rootHost}`)) {
    return NextResponse.next();
  }

  const subdomain = host.slice(0, -(rootHost.length + 1));
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.next();
  }

  const guestSlug = pathname.split("/").filter(Boolean)[0] ?? "";
  const rewritten = request.nextUrl.clone();
  rewritten.pathname = `/w/${subdomain}${guestSlug ? `/${guestSlug}` : ""}`;
  return NextResponse.rewrite(rewritten);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
