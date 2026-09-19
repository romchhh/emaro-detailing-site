import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Liveness only — no config secrets. */
export async function GET() {
  return NextResponse.json({ ok: true })
}
