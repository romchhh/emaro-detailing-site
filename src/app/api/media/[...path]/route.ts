import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { getCmsDataDir } from '@/lib/cms/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.ogg': 'video/ogg',
  '.ogv': 'video/ogg',
}

type Params = { params: Promise<{ path: string[] }> }

export async function GET(_request: Request, { params }: Params) {
  const resolved = await params
  const parts = resolved.path || []
  if (
    parts.length === 0 ||
    parts.some((part) => part.includes('..') || part.includes('/') || part.includes('\\'))
  ) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const filename = parts.join('/')
  const filePath = path.join(getCmsDataDir(), 'uploads', filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'
  const isVideo = contentType.startsWith('video/')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...(isVideo ? { 'Accept-Ranges': 'bytes' } : {}),
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
