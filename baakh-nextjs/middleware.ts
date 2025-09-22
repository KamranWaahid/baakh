import { NextRequest, NextResponse } from 'next/server';

// Default locale is Sindhi (sd)
const DEFAULT_LOCALE = 'sd';

// Add all supported locales here
const SUPPORTED_LOCALES = new Set<string>(['sd', 'en']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals, API, admin, and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Already localized?
  const segments = pathname.split('/').filter(Boolean);
  const leading = segments[0];
  if (leading && SUPPORTED_LOCALES.has(leading)) {
    return NextResponse.next();
  }

  // Redirect to default locale
  const url = request.nextUrl.clone();
  const target = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  url.pathname = target;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!.*\.).*)'],
};


