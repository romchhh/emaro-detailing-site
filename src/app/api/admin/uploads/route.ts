import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/session'
import { revalidateCmsCaches } from '@/lib/cms/cacheInvalidate'
import { getCmsDataDir, uid } from '@/lib/cms/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Large uploads (video) — Node runtime; raise Next body limit in next.config.js */
export const maxDuration = 120

const ALLOWED_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-m4v',
])

const MAX_IMAGE = 20 * 1024 * 1024
const MAX_VIDEO = 200 * 1024 * 1024

function uploadsDir() {
  const dir = path.join(getCmsDataDir(), 'uploads')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function sniffMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif'
  // WEBP (RIFF....WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp'
  }
  // MP4 / M4V / MOV (ftyp)
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    const brand = buffer.slice(8, 12).toString('ascii')
    if (brand.startsWith('qt')) return 'video/quicktime'
    return 'video/mp4'
  }
  // WEBM / MKV (EBML)
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return 'video/webm'
  }
  // OGG
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return 'video/ogg'
  }
  return null
}

function extensionFor(type: string, filename: string) {
  const fromName = path.extname(filename).toLowerCase()
  const allowedExt = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.mp4',
    '.webm',
    '.mov',
    '.m4v',
    '.ogg',
    '.ogv',
  ]
  if (fromName && allowedExt.includes(fromName)) return fromName

  if (type === 'image/png') return '.png'
  if (type === 'image/webp') return '.webp'
  if (type === 'image/gif') return '.gif'
  if (type === 'video/webm') return '.webm'
  if (type === 'video/quicktime') return '.mov'
  if (type === 'video/ogg') return '.ogv'
  if (type.startsWith('video/')) return '.mp4'
  return '.jpg'
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ ok: false, error: 'invalid_form' }, { status: 400 })
  }

  const files = form.getAll('files').filter((item): item is File => item instanceof File)
  const single = form.get('file')
  if (single instanceof File) files.push(single)

  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_files' }, { status: 400 })
  }

  const urls: string[] = []
  const items: Array<{ url: string; type: 'image' | 'video'; name: string }> = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const sniffed = sniffMime(buffer)
    const declared = file.type
    const mime = sniffed || (ALLOWED_TYPES.has(declared) ? declared : null)

    if (!mime || !ALLOWED_TYPES.has(mime)) {
      return NextResponse.json({ ok: false, error: 'unsupported_type' }, { status: 400 })
    }

    // Reject MIME spoofing when signature disagrees with declared image/video family
    if (sniffed && declared && ALLOWED_TYPES.has(declared)) {
      const sniffedVideo = sniffed.startsWith('video/')
      const declaredVideo = declared.startsWith('video/')
      if (sniffedVideo !== declaredVideo) {
        return NextResponse.json({ ok: false, error: 'unsupported_type' }, { status: 400 })
      }
    }

    const isVideo = mime.startsWith('video/')
    const max = isVideo ? MAX_VIDEO : MAX_IMAGE
    if (file.size > max) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 400 })
    }

    const filename = `${uid(isVideo ? 'vid' : 'img')}${extensionFor(mime, file.name)}`
    fs.writeFileSync(path.join(uploadsDir(), filename), buffer)
    const url = `/api/media/${filename}`
    urls.push(url)
    items.push({ url, type: isVideo ? 'video' : 'image', name: file.name })
  }

  revalidateCmsCaches()

  return NextResponse.json({
    ok: true,
    url: urls[0],
    urls,
    items,
  })
}
