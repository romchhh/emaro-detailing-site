import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/session'
import { readDb, updateDb } from '@/lib/cms/store'
import type { CmsDb } from '@/lib/cms/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function revalidateSite() {
  revalidatePath('/', 'layout')
  revalidatePath('/pl')
  revalidatePath('/uk')
  revalidatePath('/pl/privacy')
  revalidatePath('/uk/privacy')
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const db = readDb()
  return NextResponse.json({
    ok: true,
    brand: db.brand,
    services: db.services,
    gallery: db.gallery,
    beforeAfter: db.beforeAfter,
    reviews: db.reviews,
    copy: db.copy,
  })
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = (await request.json().catch(() => null)) as Partial<CmsDb> | null
  if (!body) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  updateDb((db) => {
    if (body.brand) db.brand = { ...db.brand, ...body.brand }
    if (body.services) db.services = body.services
    if (body.gallery) db.gallery = body.gallery
    if (body.beforeAfter) db.beforeAfter = body.beforeAfter
    if (body.reviews) db.reviews = body.reviews
    if (body.copy?.pl) db.copy.pl = body.copy.pl
    if (body.copy?.uk) db.copy.uk = body.copy.uk
  })

  revalidateSite()

  const db = readDb()
  return NextResponse.json({
    ok: true,
    brand: db.brand,
    services: db.services,
    gallery: db.gallery,
    beforeAfter: db.beforeAfter,
    reviews: db.reviews,
    copy: db.copy,
  })
}
