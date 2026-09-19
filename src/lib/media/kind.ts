const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.ogv'])
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

export type MediaKind = 'image' | 'video'

export function extensionOf(src: string): string {
  try {
    const path = src.startsWith('http') ? new URL(src).pathname : src.split('?')[0] || ''
    const match = path.match(/(\.[a-z0-9]+)$/i)
    return (match?.[1] || '').toLowerCase()
  } catch {
    return ''
  }
}

export function detectMediaKind(src: string, explicit?: MediaKind | string | null): MediaKind {
  if (explicit === 'video' || explicit === 'image') return explicit
  const ext = extensionOf(src)
  if (VIDEO_EXT.has(ext)) return 'video'
  if (IMAGE_EXT.has(ext)) return 'image'
  // Default: treat unknown CMS uploads as image unless mime hinted in path
  if (/\/video|\.mp4|\.webm/i.test(src)) return 'video'
  return 'image'
}

export function isVideoSrc(src: string, explicit?: MediaKind | string | null): boolean {
  return detectMediaKind(src, explicit) === 'video'
}
