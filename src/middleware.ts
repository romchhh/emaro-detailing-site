import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, isLocale } from './i18n/config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  const hasLocale = isLocale(maybeLocale)

  if (hasLocale) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', maybeLocale)
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Exclude /api so large uploads are not buffered/truncated by middleware (default ~10MB).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
