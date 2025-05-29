import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { isJwtExpired } from "./utils/is-jwt-expired";

const locales = ["fr", "en"];
const defaultLocale = "fr";

acceptLanguage.languages(locales);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  // TODO prendre en compte le parametre query d'une URL

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
      acceptLanguage.get(request.headers.get("Accept-Language")) ||
      defaultLocale;
    const newUrl = searchParams
      ? `/${locale}${pathname}?${searchParams}`
      : `/${locale}${pathname}`;
    return NextResponse.redirect(new URL(`${newUrl}`, request.url));
  }
  const protectedRoutes =
    /^\/(fr|en)\/(community|create-community|profile)(\/|$)/;
  console.log("All cooies", request.cookies.getAll());
  if (protectedRoutes.test(pathname)) {
    const accessToken = request.cookies.get("access-token")?.value;
    const refreshToken = request.cookies.get("refresh-token")?.value;
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);
    const currentLocale =
      locales.find((locale) => pathname.startsWith(`/${locale}`)) ||
      defaultLocale;

    if (accessToken && !isJwtExpired(accessToken)) {
      return NextResponse.next();
    }

    if (!accessToken && refreshToken) {
      try {
        const response = await fetch("http://backend:4000/auth/refresh-token", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-internal-call": "true",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          const res = NextResponse.next();

          res.cookies.set("access-token", data.access_token, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60,
          });

          return res;
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
    }

    if (!accessToken) {
      const res = NextResponse.redirect(
        new URL(`/${currentLocale}/sign-in`, request.url)
      );
      res.cookies.delete("access-token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
