'use client'

import { useState, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import CheckinModal from '@/components/ui/CheckinModal'
import EditCheckinModal from '@/components/ui/EditCheckinModal'
import { useStore } from '@/lib/store'
import { Pencil, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { formatFullDate, toDateString } from '@/lib/utils/dates'
import type { Checkin } from '@/lib/types'

type View = 'month' | 'year' | 'other'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

function groupByMonth(entries: Checkin[]) {
    const map = new Map<string, Checkin[]>()
    for (const entry of entries) {
        const key = entry.date.slice(0, 7) // YYYY-MM
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(entry)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
}

function JournalContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [checkinOpen, setCheckinOpen] = useState(false)
    const [editEntry, setEditEntry] = useState<Checkin | null>(null)
    const [view, setView] = useState<View>('month')
    const [selectedOtherYear, setSelectedOtherYear] = useState<number | null>(null)

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthStr = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const entries = useMemo(() =>
        [...store.checkins].sort((a, b) => b.date.localeCompare(a.date))
        , [store.checkins])

    const totalCount = entries.length

    const monthEntries = useMemo(() => entries.filter(e => e.date.startsWith(currentMonthStr)), [entries, currentMonthStr])
    const yearMonthGroups = useMemo(() => groupByMonth(entries.filter(e => e.date.startsWith(String(currentYear)))), [entries, currentYear])

    const otherYears = useMemo(() => {
        const years = new Set<number>()
        for (const e of entries) {
            const y = parseInt(e.date.slice(0, 4))
            if (y !== currentYear) years.add(y)
        }
        return Array.from(years).sort((a, b) => b - a)
    }, [entries, currentYear])

    const otherYearMonthGroups = useMemo(() => {
        if (!selectedOtherYear) return []
        return groupByMonth(entries.filter(e => e.date.startsWith(String(selectedOtherYear))))
    }, [entries, selectedOtherYear])

    function handleSaveCheckin(data: { proud: string; tomorrow: string; notes: string }) {
        store.saveCheckin({
            date: toDateString(new Date()),
            proud: data.proud,
            tomorrow: data.tomorrow,
            notes: data.notes,
        })
        setCheckinOpen(false)
        showToast('Reflection saved')
    }

    function entryNumber(entry: Checkin) {
        const idx = entries.findIndex(e => e.id === entry.id)
        return totalCount - idx
    }

    function ReflectionCard({ entry }: { entry: Checkin }) {
        return (
            <article className="group bg-surface border border-border rounded-2xl p-5 hover:border-border2 transition-colors duration-150">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 text-xs font-semibold text-white bg-surface3 flex items-center justify-center rounded-full">
                            {entryNumber(entry)}
                        </span>
                        <span className="text-[12px] font-medium text-[#1a1a1a] bg-[#f0f0f0] px-2.5 py-0.5 rounded-full">
                            {formatFullDate(new Date(entry.date + 'T12:00:00'))}
                        </span>
                    </div>
                    <button
                        onClick={() => setEditEntry(entry)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md border border-border text-text3 hover:bg-surface2 hover:border-border2 hover:text-text transition-all duration-150 flex-shrink-0"
                        title="Edit"
                    >
                        <Pencil size={10} strokeWidth={1.5} />
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    {entry.proud && (
                        <div>
                            <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1">Proud of</div>
                            <p className="text-[14px] text-text leading-relaxed">{entry.proud}</p>
                        </div>
                    )}
                    {entry.tomorrow && (
                        <div>
                            <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1">Tomorrow</div>
                            <p className="text-[14px] text-text leading-relaxed">{entry.tomorrow}</p>
                        </div>
                    )}
                    {entry.notes && (
                        <div>
                            <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1">Notes</div>
                            <p className="text-[14px] text-text leading-relaxed">{entry.notes}</p>
                        </div>
                    )}
                </div>
            </article>
        )
    }

    function MonthSummaryCard({ monthKey, monthEntries }: { monthKey: string; monthEntries: Checkin[] }) {
        const [mm, yyyy] = [parseInt(monthKey.slice(5, 7)) - 1, parseInt(monthKey.slice(0, 4))]
        const monthName = MONTH_NAMES[mm]
        const first = monthEntries[monthEntries.length - 1] // oldest first for preview
        return (
            <article className="bg-surface border border-border rounded-2xl p-5 hover:border-border2 transition-colors duration-150">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-[15px] text-text">{monthName} {yyyy}</span>
                    <span className="bg-surface3 text-white font-semibold text-[10px] px-1.5 py-px rounded-full">
                        {monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'}
                    </span>
                </div>
                {first?.proud && (
                    <p className="text-[13px] text-text3 leading-relaxed line-clamp-2">{first.proud}</p>
                )}
            </article>
        )
    }

    function EmptyState() {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center mb-4">
                    <span className="text-[20px]">✦</span>
                </div>
                <h2 className="font-semibold text-[18px] text-text leading-tight mb-2">No reflections here</h2>
                <p className="text-[13px] text-text2 max-w-[260px] mb-4">
                    Nothing to show for this period yet.
                </p>
                <Button onClick={() => setCheckinOpen(true)}>
                    <Plus size={14} strokeWidth={1.5} />
                    Add reflection
                </Button>
            </div>
        )
    }

    const views: { key: View; label: string }[] = [
        { key: 'month', label: 'This Month' },
        { key: 'year', label: 'This Year' },
        { key: 'other', label: 'Other Years' },
    ]

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0">
                    <Topbar
                        title={<h1 className="font-semibold text-[22px] leading-tight text-text">Journal</h1>}
                        onMenuClick={toggle}
                        extra={
                            <Button onClick={() => setCheckinOpen(true)}>
                                <Plus size={14} strokeWidth={1.5} />
                                Add reflection
                            </Button>
                        }
                    />

                    {/* View tabs */}
                    <div className="flex items-center gap-1 mb-5">
                        {views.map((v) => (
                            <button
                                key={v.key}
                                onClick={() => { setView(v.key); if (v.key === 'other' && !selectedOtherYear && otherYears.length > 0) setSelectedOtherYear(otherYears[0]) }}
                                className={`text-[13px] font-medium px-3 h-[34px] rounded-lg transition-all duration-150 ${view === v.key ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>

                    {/* Year selector for Other Years */}
                    {view === 'other' && otherYears.length > 1 && (
                        <div className="flex items-center gap-1 mb-5">
                            {otherYears.map((y) => (
                                <button
                                    key={y}
                                    onClick={() => setSelectedOtherYear(y)}
                                    className={`text-[13px] font-medium px-3 h-[34px] rounded-lg transition-all duration-150 ${selectedOtherYear === y ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {view === 'month' && (
                        monthEntries.length === 0 ? <EmptyState /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {monthEntries.map(e => <ReflectionCard key={e.id} entry={e} />)}
                            </div>
                        )
                    )}

                    {view === 'year' && (
                        yearMonthGroups.length === 0 ? <EmptyState /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {yearMonthGroups.map(([key, mes]) => (
                                    <MonthSummaryCard key={key} monthKey={key} monthEntries={mes} />
                                ))}
                            </div>
                        )
                    )}

                    {view === 'other' && (
                        otherYears.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-[14px] text-text2">No entries from previous years yet.</p>
                            </div>
                        ) : (
                            otherYearMonthGroups.length === 0 ? <EmptyState /> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                    {otherYearMonthGroups.map(([key, mes]) => (
                                        <MonthSummaryCard key={key} monthKey={key} monthEntries={mes} />
                                    ))}
                                </div>
                            )
                        )
                    )}
                </div>
            </div>

            <CheckinModal
                isOpen={checkinOpen}
                onClose={() => setCheckinOpen(false)}
                onSave={handleSaveCheckin}
            />
            <EditCheckinModal
                checkin={editEntry}
                isOpen={!!editEntry}
                onClose={() => setEditEntry(null)}
                onSave={(updated) => { store.updateCheckin(updated); showToast('Reflection updated') }}
                onDelete={(id) => { store.deleteCheckin(id); showToast('Reflection deleted') }}
            />
        </>
    )
}

export default function JournalPage() {
    return (
        <AppShell>
            <JournalContent />
        </AppShell>
    )
}
