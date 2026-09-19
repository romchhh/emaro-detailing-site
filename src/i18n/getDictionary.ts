import type { Locale } from './config'
import type { Dictionary } from './types'
import { cmsDictionary } from '@/lib/cms/content'
import { pl } from './dictionaries/pl'
import { uk } from './dictionaries/uk'

const fallback = { pl, uk } as const

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    return cmsDictionary(locale)
  } catch {
    return (fallback[locale] ?? fallback.pl) as Dictionary
  }
}

export function getDictionarySync(locale: Locale): Dictionary {
  try {
    return cmsDictionary(locale)
  } catch {
    return (fallback[locale] ?? fallback.pl) as Dictionary
  }
}
