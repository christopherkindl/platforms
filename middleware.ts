import { NextResponse } from "next/server";
import authConfig from "auth.config";
import NextAuth from "@auth/nextjs";
import { NextAuthRequest } from "@auth/nextjs/lib";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|examples/|[\\w-]+\\.\\w+).*)",
  ],
};

const auth = NextAuth(authConfig).auth;

export default auth(async function middleware(req: NextAuthRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get("host");

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  if (hostname === `app.localhost:3000`) {
    const session = req.auth?.user;
    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.rewrite(new URL(`/app${path}`, req.url));
  }

  // rewrite everything else to `/[domain]/[path] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
});
