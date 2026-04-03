export function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function isToday(dateStr: string): boolean {
    return dateStr === toDateString(new Date())
}

export function isOverdue(dateStr: string | null): boolean {
    if (!dateStr) return false
    return dateStr < toDateString(new Date())
}

export function isThisWeek(dateStr: string | null): boolean {
    if (!dateStr) return false
    const today = new Date()
    const todayStr = toDateString(today)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekEndStr = toDateString(weekEnd)
    return dateStr > todayStr && dateStr <= weekEndStr
}

export function formatDeadline(dateStr: string | null): string {
    if (!dateStr) return ''
    const todayStr = toDateString(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = toDateString(yesterday)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = toDateString(tomorrow)

    if (dateStr === todayStr) return 'Today'
    if (dateStr === yesterdayStr) return 'Yesterday'
    if (dateStr === tomorrowStr) return 'Tomorrow'

    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysRemaining(endDate: string): number {
    const end = new Date(endDate + 'T00:00:00')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diff = end.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getSprintProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const total = end.getTime() - start.getTime()
    if (total <= 0) return 100
    const elapsed = today.getTime() - start.getTime()
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

export function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start + 'T00:00:00')
    const endDate = new Date(end + 'T00:00:00')
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${startStr} → ${endStr}`
}

export function formatWeekRange(): string {
    const now = new Date()
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const startStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase().replace(/\./g, '')
    const endStr = weekEnd.toLocaleDateString('en-US', { day: 'numeric' })
    return `${startStr}–${endStr}`
}

export function formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function groupByDate(dateStr: string): string {
    const todayStr = toDateString(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = toDateString(yesterday)

    if (dateStr === todayStr) return 'Today'
    if (dateStr === yesterdayStr) return 'Yesterday'

    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysSince(isoTimestamp: string): number {
    const then = new Date(isoTimestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thenDate = new Date(then.getFullYear(), then.getMonth(), then.getDate())
    return Math.floor((today.getTime() - thenDate.getTime()) / (1000 * 60 * 60 * 24))
}

export function isWithinDays(isoTimestamp: string, days: number): boolean {
    return daysSince(isoTimestamp) < days
}
