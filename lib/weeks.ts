const START = new Date('2026-04-20')
export const TOTAL_WEEKS = 20

export function getWeekInfo(w: number): string {
  const mon = new Date(START)
  mon.setDate(mon.getDate() + (w - 1) * 7)
  const thu = new Date(mon)
  thu.setDate(thu.getDate() + 3)
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${fmt(mon)} – ${fmt(thu)}`
}

export function getCurrentWeek(): number {
  const diff = Math.floor((Date.now() - START.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(1, Math.min(TOTAL_WEEKS, diff + 1))
}
