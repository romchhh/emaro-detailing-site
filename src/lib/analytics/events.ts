export const ANALYTICS_EVENTS = [
  'pageview',
  'form_start',
  'form_submit',
  'phone_click',
  'whatsapp_click',
  'telegram_click',
  'lead',
] as const

export type AnalyticsEventType = (typeof ANALYTICS_EVENTS)[number]

export function isAnalyticsEventType(value: string): value is AnalyticsEventType {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value)
}
