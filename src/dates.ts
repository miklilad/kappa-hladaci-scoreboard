import type { IsoDate } from './scores.ts'

/** Parses as local midnight; `new Date(iso)` would be UTC and can land on the previous day. */
export function fromIsoDate(iso: IsoDate): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` as IsoDate
}

const longDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' })

export const formatDate = (iso: IsoDate) => longDate.format(fromIsoDate(iso))

const shortDate = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

export const formatShortDate = (iso: IsoDate) => shortDate.format(fromIsoDate(iso))
