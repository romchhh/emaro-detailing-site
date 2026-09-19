import { revalidateTag } from 'next/cache'

/** Shared cache tags for public CMS data (texts + media structures). */
export const CMS_CACHE_TAG = 'cms-public'
export const CMS_DICT_TAG = 'cms-dict'
export const CMS_MEDIA_TAG = 'cms-media'

/** Invalidate Next.js data cache after CMS writes. */
export function revalidateCmsCaches() {
  try {
    revalidateTag(CMS_CACHE_TAG)
    revalidateTag(CMS_DICT_TAG)
    revalidateTag(CMS_MEDIA_TAG)
  } catch {
    // Outside Next request context — safe to ignore
  }
}
