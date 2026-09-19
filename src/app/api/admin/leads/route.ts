import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/session'
import { readDb, updateDb } from '@/lib/cms/store'
import type { Lead, LeadStatus } from '@/lib/cms/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUSES: LeadStatus[] = ['new', 'in_progress', 'done', 'archived']

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  return NextResponse.json({ ok: true, leads: readDb().leads })
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = (await request.json().catch(() => null)) as {
    id?: string
    status?: LeadStatus
    notes?: string
  } | null

  if (!body?.id) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  let updated: Lead | null = null
  updateDb((db) => {
    const lead = db.leads.find((item) => item.id === body.id)
    if (!lead) return
    if (body.status && STATUSES.includes(body.status)) lead.status = body.status
    if (typeof body.notes === 'string') lead.notes = body.notes
    lead.updatedAt = new Date().toISOString()
    updated = lead
  })

  if (!updated) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, lead: updated })
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  updateDb((db) => {
    db.leads = db.leads.filter((lead) => lead.id !== id)
  })

  return NextResponse.json({ ok: true })
}
