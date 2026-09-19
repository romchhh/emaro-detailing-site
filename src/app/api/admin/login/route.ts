import { NextResponse } from 'next/server'
import { readAdminDb } from '@/lib/cms/store'
import {
  ADMIN_COOKIE,
  authenticateUser,
  createSession,
  destroySession,
  getRequestSession,
} from '@/lib/cms/session'
import { getClientIp, isRateLimited } from '@/lib/security/rateLimit'
import { expectsJson, isAllowedOrigin } from '@/lib/security/requestGuard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getRequestSession()
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const user = readAdminDb().users.find((u) => u.id === session.userId)
  return NextResponse.json({
    ok: true,
    login: session.login,
    name: user?.name || 'Administrator',
    roleId: 'owner',
    permissions: ['dashboard', 'leads', 'content'],
  })
}

export async function POST(request: Request) {
  if (!expectsJson(request)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 415 })
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const ip = getClientIp(request)
  if (isRateLimited(`login:${ip}`, { windowMs: 15 * 60_000, max: 12 })) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as {
    login?: string
    password?: string
    remember?: boolean
  } | null

  if (!body?.login || !body?.password) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const login = String(body.login).trim().slice(0, 80)
  const password = String(body.password).slice(0, 200)

  const user = authenticateUser(login, password)
  if (!user) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 })
  }

  const { token, maxAge } = createSession(user.id, user.login, Boolean(body.remember))
  const response = NextResponse.json({
    ok: true,
    login: user.login,
    name: user.name,
    roleId: 'owner',
    permissions: ['dashboard', 'leads', 'content'],
  })

  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })

  return response
}

export async function DELETE() {
  const session = await getRequestSession()
  destroySession(session?.token)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
