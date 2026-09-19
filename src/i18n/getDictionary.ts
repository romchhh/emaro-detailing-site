import { cache } from 'react'
import type { Locale } from './config'
import type { Dictionary } from './types'
import { getCachedDictionary } from '@/lib/cms/cache'
import { cmsDictionary } from '@/lib/cms/content'
import { pl } from './dictionaries/pl'
import { uk } from './dictionaries/uk'

const fallback = { pl, uk } as const

/** Locale texts from CMS — Next data cache + per-request React.cache. */
export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  return getCachedDictionary(locale)
})

export function getDictionarySync(locale: Locale): Dictionary {
  try {
    return cmsDictionary(locale)
  } catch {
    return structuredClone((fallback[locale] ?? fallback.pl) as Dictionary)
  }
}
