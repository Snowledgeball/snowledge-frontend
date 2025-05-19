import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";

const locales = ["fr", "en"];
const defaultLocale = "fr";

acceptLanguage.languages(locales);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignore les fichiers statiques ou routes spéciales
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}`)
  );

  if (pathnameIsMissingLocale) {
    const locale =
      acceptLanguage.get(request.headers.get("Accept-Language")) || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"]
};