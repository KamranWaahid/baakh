import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, createCSPHeader } from './src/lib/security/nonce';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip locale redirects for admin routes and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = /^\/[a-z]{2}(\/|$)/.test(pathname);
  
  if (!pathnameHasLocale) {
    // Redirect to default locale (Sindhi)
    const locale = 'sd';
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  
  // Enforce allowed route shapes per locale; redirect unknowns to the locale home
  const locale = pathname.split('/')[1]; // sd | en
  const allowedPatterns: RegExp[] = [
    new RegExp(`^/(sd|en)/?$`),
    new RegExp(`^/(sd|en)/page/[a-z0-9-]+/?$`),
    new RegExp(`^/(sd|en)/poets(?:/.*)?$`),
    new RegExp(`^/(sd|en)/poetry(?:/.*)?$`),
    new RegExp(`^/(sd|en)/couplets/[a-z0-9-]+/?$`),
    new RegExp(`^/(sd|en)/categories/[a-z0-9-]+/?$`),
    new RegExp(`^/(sd|en)/topics/[a-z0-9-]+/?$`),
    new RegExp(`^/(sd|en)/timeline/?$`),
    new RegExp(`^/(sd|en)/login/?$`),
    new RegExp(`^/(sd|en)/about/?$`),
    new RegExp(`^/(sd|en)/contact/?$`),
    new RegExp(`^/(sd|en)/donate/?$`),
    new RegExp(`^/(sd|en)/terms/?$`),
    new RegExp(`^/(sd|en)/privacy/?$`),
  ];

  const isAllowed = allowedPatterns.some((re) => re.test(pathname));
  if (!isAllowed) {
    const newUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  const response = NextResponse.next();
  
  // Add basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  // Run on all paths except _next, api, and static files
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};


