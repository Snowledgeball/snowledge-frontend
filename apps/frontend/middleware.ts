    import { NextRequest, NextResponse } from "next/server";
    import acceptLanguage from "accept-language";

    const locales = ["fr", "en"];
    const defaultLocale = "fr";

    acceptLanguage.languages(locales);

    export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
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
        acceptLanguage.get(request.headers.get("Accept-Language")) || defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
    }
    const protectedRoutes = /^\/(fr|en)\/(community|create-community|settings)(\/|$)/;

    if (protectedRoutes.test(pathname)) {
        const accessToken = request.cookies.get("access-token")?.value;
        const refreshToken = request.cookies.get("refresh-token")?.value;

        if (!accessToken && refreshToken) {
            try {
                const response = await fetch("http://localhost:4000/auth/refresh-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const res = NextResponse.next();

                    res.cookies.set("access-token", data.access_token, {
                        path: "/",
                        sameSite: "lax",
                    });

                    return res;
                }
            } catch (e) {
                console.error("Token refresh failed:", e);
            }
        }

        if (!accessToken) {
            return NextResponse.redirect(new URL(`/${defaultLocale}/sign-in`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|.*\\..*|api).*)"]
};