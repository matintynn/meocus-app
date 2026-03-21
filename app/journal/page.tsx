'use client'

import { useState, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import CheckinModal from '@/components/ui/CheckinModal'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { formatFullDate, toDateString } from '@/lib/utils/dates'

function JournalContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [checkinOpen, setCheckinOpen] = useState(false)

    const entries = useMemo(() => {
        return [...store.checkins].sort((a, b) => b.date.localeCompare(a.date))
    }, [store.checkins])

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

    return (
        <>
            <div className="mt-6">
                <Topbar
                    title={
                        <div className="flex items-center gap-3">
                            <h1 className="font-semibold text-[22px] leading-tight text-text">
                                Journal
                            </h1>
                        </div>
                    }
                    onMenuClick={toggle}
                    extra={
                        <Button onClick={() => setCheckinOpen(true)} className="text-[13px] px-3 py-1.5">
                            + Add reflection
                        </Button>
                    }
                />

                {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center mb-4">
                            <span className="text-[20px]">✦</span>
                        </div>
                        <h2 className="font-semibold text-[18px] text-text leading-tight mb-2">
                            No reflections yet
                        </h2>
                        <p className="text-[13px] text-text2 max-w-[280px] mb-4">
                            Take a moment to reflect on your day. Your entries will appear here.
                        </p>
                        <Button onClick={() => setCheckinOpen(true)} className="text-[13px]">
                            Write your first reflection
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {entries.map((entry) => {
                            const isToday = entry.date === toDateString(new Date())
                            return (
                                <article
                                    key={entry.id}
                                    className="bg-surface border border-border rounded-2xl p-5 hover:border-border2 transition-colors duration-150"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-learn flex-shrink-0" />
                                        <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">
                                            {formatFullDate(new Date(entry.date + 'T12:00:00'))}
                                        </span>
                                        {isToday && (
                                            <span className="text-[10px] font-medium text-learn bg-learn/10 px-1.5 py-px rounded-full">
                                                Today
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {entry.proud && (
                                            <div>
                                                <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1">
                                                    Proud of
                                                </div>
                                                <p className="text-[14px] text-text leading-relaxed">
                                                    {entry.proud}
                                                </p>
                                            </div>
                                        )}

                                        {entry.tomorrow && (
                                            <div>
                                                <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1">
                                                    Tomorrow
                                                </div>
                                                <p className="text-[14px] text-text leading-relaxed">
                                                    {entry.tomorrow}
                                                </p>
                                            </div>
                                        )}

                                        {entry.notes && (
                                            <div>
                                                <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1">
                                                    Notes
                                                </div>
                                                <p className="text-[14px] text-text leading-relaxed">
                                                    {entry.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>

            <CheckinModal
                isOpen={checkinOpen}
                onClose={() => setCheckinOpen(false)}
                onSave={handleSaveCheckin}
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
