import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/session'
import { cmsDashboardStats } from '@/lib/cms/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  return NextResponse.json(cmsDashboardStats())
}
