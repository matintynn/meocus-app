'use client'

import { useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import Tag from '@/components/ui/Tag'
import { useStore } from '@/lib/store'
import { daysSince } from '@/lib/utils/dates'

function ActivityContent() {
    const toggle = useSidebarToggle()
    const store = useStore()

    const recentGrouped = useMemo(() => {
        const groups: { label: string; tasks: typeof store.recentTasks }[] = []
        const groupMap = new Map<string, typeof store.recentTasks>()

        for (const task of store.recentTasks) {
            const d = daysSince(task.createdAt)
            let label: string
            if (d === 0) label = 'Today'
            else if (d === 1) label = 'Yesterday'
            else label = `${d} days ago`

            if (!groupMap.has(label)) {
                groupMap.set(label, [])
                groups.push({ label, tasks: groupMap.get(label)! })
            }
            groupMap.get(label)!.push(task)
        }
        return groups
    }, [store.recentTasks])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 mt-4">
                <Topbar
                    title={
                        <h1 className="font-semibold text-[22px] leading-tight text-text">
                            Activity
                        </h1>
                    }
                    onMenuClick={toggle}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {recentGrouped.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <h2 className="font-semibold text-[18px] text-text leading-tight mb-2">
                            No recent activity
                        </h2>
                        <p className="text-[13px] text-text2">
                            Tasks created or completed in the last 7 days will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {recentGrouped.map((group) => (
                            <div key={group.label}>
                                <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-3">
                                    {group.label}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {group.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-3 bg-surface border border-border rounded-xl px-4 py-3"
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${task.isDone ? 'bg-text3' : 'bg-text2'}`} />
                                            <div className="min-w-0 flex-1">
                                                <div className={`text-[14px] leading-snug ${task.isDone ? 'line-through text-text3' : 'text-text'}`}>
                                                    {task.title}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Tag variant={task.bucket} label={task.bucket} size="sm" />
                                                    {task.isDone && (
                                                        <span className="text-[10px] text-text3">completed</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ActivityPage() {
    return (
        <AppShell>
            <ActivityContent />
        </AppShell>
    )
}
