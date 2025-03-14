import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/confirm-account', '/forgot-password', '/reset-password']

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  // const hostname = req.headers.get("host")!
  //   .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
  //   .replace(".localtest.me:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Se não for rota pública, verifica autenticação
  if (!isPublicRoute) {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    })

    // Se não estiver autenticado, redireciona para login
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // // rewrites for app pages
  // if (hostname === `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
  //   return NextResponse.rewrite(
  //     new URL(`/app${path === "/overview" ? "" : path}`, req.url)
  //   );
  // }

  // // special case for `vercel.pub` homepage
  // if (hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
  //   return NextResponse.rewrite(new URL("/home", req.url));
  // }

  // // rewrite root application to `/home` folder
  // if (hostname === "localhost:3000" || hostname === "localtest.me:3000" || hostname === "127.0.0.1:3000") {
  //   return NextResponse.rewrite(new URL(`/home${path}`, req.url));
  // }

  return NextResponse.next();
}