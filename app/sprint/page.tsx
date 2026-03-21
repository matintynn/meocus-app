'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import GoalCard from '@/components/sprint/GoalCard'
import SprintModal from '@/components/sprint/SprintModal'
import TaskItem from '@/components/tasks/TaskItem'
import Button from '@/components/ui/Button'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import {
    formatDateRange,
    daysRemaining,
    getSprintProgress,
} from '@/lib/utils/dates'
import { Bucket, Sprint } from '@/lib/types'

function SprintContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [modalOpen, setModalOpen] = useState(false)
    const notesRef = useRef<HTMLTextAreaElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const sprint = store.sprint

    const handleSaveSprint = useCallback(
        (data: Omit<Sprint, 'id'>) => {
            store.setSprint(data)
            showToast('Sprint saved')
        },
        [store, showToast]
    )

    const handleNotesChange = useCallback(
        (value: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
                store.updateSprintNotes(value)
                showToast('Notes saved')
            }, 300)
        },
        [store, showToast]
    )

    const handleEndSprint = useCallback(() => {
        if (sprint) {
            store.setSprint({ ...sprint, isActive: false })
            setModalOpen(true)
        }
    }, [sprint, store])

    // Sprint tasks grouped by bucket
    const sprintTasksByBucket = useMemo(() => {
        if (!sprint) return []
        const buckets: Bucket[] = ['work', 'learn', 'life']
        return buckets.map((bucket) => {
            const tasks = store.tasks.filter(
                (t) => t.sprintId === sprint.id && t.bucket === bucket
            )
            const done = tasks.filter((t) => t.isDone).length
            return { bucket, tasks, done, total: tasks.length }
        })
    }, [sprint, store.tasks])

    // ─── Empty state ───────────────────────────────────
    if (!sprint || !sprint.isActive) {
        return (
            <>
                <div className="mt-6">
                    <Topbar
                        title={
                            <h1 className="font-semibold text-[22px] leading-tight text-text">
                                Sprint
                            </h1>
                        }
                        onMenuClick={toggle}
                    />
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <h2 className="font-semibold text-[22px] text-text leading-tight mb-2">
                            No active sprint
                        </h2>
                        <p className="text-[13px] text-text2 mb-6">
                            A sprint is 2 weeks of focused progress.
                        </p>
                        <Button onClick={() => setModalOpen(true)}>Start first sprint</Button>
                    </div>
                </div>
                <SprintModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveSprint}
                />
            </>
        )
    }

    // ─── Active sprint ─────────────────────────────────
    const progress = getSprintProgress(sprint.startDate, sprint.endDate)
    const days = daysRemaining(sprint.endDate)

    return (
        <>
            <div className="mt-6">
                <Topbar
                    title={
                        <h1 className="font-semibold text-[22px] leading-tight text-text">
                            Sprint
                        </h1>
                    }
                    onMenuClick={toggle}
                />

                {/* Sprint header */}
                <div className="mb-7">
                    <h2 className="font-semibold text-[28px] leading-tight text-text mb-1">
                        {sprint.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-text2">
                            {formatDateRange(sprint.startDate, sprint.endDate)}
                        </span>
                        <span className="bg-surface2 text-text2 text-[12px] rounded-full px-2.5 py-0.5">
                            {days > 0 ? `${days} days left` : 'Sprint ended'}
                        </span>
                    </div>
                </div>

                {/* Goal cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">
                    <GoalCard bucket="work" goal={sprint.workGoal} />
                    <GoalCard bucket="learn" goal={sprint.learnGoal} />
                    <GoalCard bucket="life" goal={sprint.lifeGoal} />
                </div>

                {/* Progress section */}
                <section className="mb-7">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">
                            Sprint Progress
                        </span>
                        <span className="text-[11px] text-text3">{progress}% through</span>
                    </div>
                    <div className="w-full h-2 bg-surface3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-text rounded-full transition-all duration-150"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-[13px] text-text3 mt-1.5">
                        {days > 0 ? `${days} days remaining` : 'Sprint ended'}
                    </div>
                </section>

                {/* Sprint tasks by bucket */}
                <section className="mb-7">
                    <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-3">
                        Sprint Tasks
                    </div>
                    {sprintTasksByBucket.map(({ bucket, tasks, done, total }) => (
                        <div key={bucket} className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-[7px] h-[7px] rounded-full"
                                        style={{
                                            backgroundColor:
                                                bucket === 'work'
                                                    ? '#3B82F6'
                                                    : bucket === 'learn'
                                                        ? '#F59E0B'
                                                        : '#D946EF',
                                        }}
                                    />
                                    <span className="text-[13px] text-text font-medium">
                                        {bucket === 'life' ? 'Personal' : bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                                    </span>
                                </div>
                                <span className="text-[12px] text-text3">
                                    {done} / {total} done
                                </span>
                            </div>
                            {total > 0 && (
                                <div className="w-full h-1 bg-surface3 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full rounded-full transition-all duration-150"
                                        style={{
                                            width: total > 0 ? `${(done / total) * 100}%` : '0%',
                                            backgroundColor:
                                                bucket === 'work'
                                                    ? '#3B82F6'
                                                    : bucket === 'learn'
                                                        ? '#F59E0B'
                                                        : '#D946EF',
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                {tasks.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                            {total === 0 && (
                                <div className="text-[13px] text-text3 py-2 ml-4">
                                    No tasks tagged to sprint
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Sprint notes */}
                <section className="mb-7">
                    <label className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-2">
                        Sprint Notes
                    </label>
                    <textarea
                        ref={notesRef}
                        defaultValue={sprint.notes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Jot down thoughts, blockers, wins…"
                        className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none resize-none min-h-[100px] leading-relaxed"
                    />
                </section>

                {/* End sprint */}
                <div className="flex justify-center pb-8">
                    <Button variant="ghost" className="!text-text3" onClick={handleEndSprint}>
                        End sprint & plan next →
                    </Button>
                </div>
            </div>

            <SprintModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveSprint}
            />
        </>
    )
}

export default function SprintPage() {
    return (
        <AppShell>
            <SprintContent />
        </AppShell>
    )
}
