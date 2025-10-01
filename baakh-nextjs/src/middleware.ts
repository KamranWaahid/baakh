import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = ['sd', 'en'].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Default to Sindhi for this Sindhi poetry site
    let locale = 'sd'
    
    // Only check for English preference if explicitly requested
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage && acceptLanguage.includes('en') && !acceptLanguage.includes('sd')) {
      locale = 'en'
    }

    // Redirect to the locale-specific URL
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)']
}
