'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import SprintModal from '@/components/sprint/SprintModal'
import AddTaskModal from '@/components/ui/AddTaskModal'
import Modal from '@/components/ui/Modal'
import TaskItem from '@/components/tasks/TaskItem'
import Button from '@/components/ui/Button'
import { ChevronRight, Plus } from 'lucide-react'
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
    const [addTaskOpen, setAddTaskOpen] = useState(false)
    const [endConfirmOpen, setEndConfirmOpen] = useState(false)
    const [notesExpanded, setNotesExpanded] = useState(false)
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
        if (!sprint) return
        const incompleteTasks = store.tasks.filter((t) => t.sprintId === sprint.id && !t.isDone)
        if (incompleteTasks.length > 0) {
            setEndConfirmOpen(true)
        } else {
            store.setSprint({ ...sprint, isActive: false })
            if (store.settings.confettiOnDone) store.triggerConfetti()
            setModalOpen(true)
        }
    }, [sprint, store])

    const handleEndSprintDeleteTasks = useCallback(() => {
        if (!sprint) return
        const incompleteTasks = store.tasks.filter((t) => t.sprintId === sprint.id && !t.isDone)
        incompleteTasks.forEach((t) => store.deleteTask(t.id))
        store.setSprint({ ...sprint, isActive: false })
        setEndConfirmOpen(false)
        setModalOpen(true)
    }, [sprint, store])

    const handleEndSprintUntagTasks = useCallback(() => {
        if (!sprint) return
        const incompleteTasks = store.tasks.filter((t) => t.sprintId === sprint.id && !t.isDone)
        incompleteTasks.forEach((t) => store.updateTask(t.id, { sprintId: null }))
        store.setSprint({ ...sprint, isActive: false })
        setEndConfirmOpen(false)
        setModalOpen(true)
    }, [sprint, store])

    const handleAddTask = useCallback(
        (data: { title: string; bucket: any; urgency: any; deadline: string | null; tagToSprint: boolean; notes: string }) => {
            store.addTask({
                title: data.title,
                bucket: data.bucket,
                urgency: data.urgency,
                deadline: data.deadline,
                notes: data.notes,
                sprintId: sprint?.id ?? null,
                isDone: false,
                doneAt: null,
                isPinnedToday: false,
                pinnedDate: null,
                carriedOver: false,
            })
            setAddTaskOpen(false)
        },
        [sprint, store]
    )

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
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-shrink-0">
                        <Topbar
                            title={
                                <h1 className="font-semibold text-[22px] leading-tight text-text">
                                    Sprint
                                </h1>
                            }
                            onMenuClick={toggle}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 pb-[15%] text-center">
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

    const totalSprintTasks = sprintTasksByBucket.reduce((sum, b) => sum + b.total, 0)
    const totalSprintDone = sprintTasksByBucket.reduce((sum, b) => sum + b.done, 0)
    const taskProgress = totalSprintTasks > 0 ? Math.round((totalSprintDone / totalSprintTasks) * 100) : 0

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0">
                    <Topbar
                        title={
                            <h1 className="font-semibold text-[22px] leading-tight text-text">
                                Sprint
                            </h1>
                        }
                        onMenuClick={toggle}
                        extra={
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" className="!text-text3" onClick={handleEndSprint}>
                                    End sprint &amp; plan next <ChevronRight size={12} />
                                </Button>
                                <Button onClick={() => setAddTaskOpen(true)}>
                                    <Plus size={13} /> Add task
                                </Button>
                            </div>
                        }
                    />
                </div>

                {/* Sprint header + notes side by side (3-col grid, header=2, notes=1) */}
                <div className="flex-shrink-0 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Header card — 2 cols */}
                    <div className="md:col-span-2 bg-surface/50 border border-border rounded-xl px-4 py-4">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                                    {sprint.title}
                                </h2>
                                <span className="text-[13px] text-text2">
                                    {formatDateRange(sprint.startDate, sprint.endDate)}
                                </span>
                            </div>
                            <span className="text-[11px] text-text3 flex-shrink-0 mt-1">
                                {days > 0 ? `${days} days left` : 'Sprint ended'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-surface3 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${taskProgress}%`, backgroundColor: '#22C55E' }}
                                />
                            </div>
                            <span className="text-[11px] text-text3 flex-shrink-0">{totalSprintDone}/{totalSprintTasks} tasks</span>
                        </div>
                    </div>

                    {/* Notes card — 1 col */}
                    <div className="bg-surface/50 border border-border rounded-xl px-4 py-4 flex flex-col">
                        <span className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-2">
                            Sprint Notes
                        </span>
                        {notesExpanded ? (
                            <>
                                <textarea
                                    ref={notesRef}
                                    defaultValue={sprint.notes}
                                    onChange={(e) => handleNotesChange(e.target.value)}
                                    placeholder="Jot down thoughts, blockers, wins…"
                                    autoFocus
                                    className="flex-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[13px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none resize-none leading-relaxed min-h-[80px]"
                                />
                                <button
                                    onClick={() => setNotesExpanded(false)}
                                    className="mt-2 text-[12px] text-text3 hover:text-text2 text-left transition-colors"
                                >
                                    Done
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex-1">
                                    {sprint.notes ? (
                                        <p className="text-[13px] text-text leading-relaxed truncate">
                                            {sprint.notes}
                                        </p>
                                    ) : (
                                        <p className="text-[13px] text-text3 italic">No notes yet</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    {sprint.notes && (
                                        <button
                                            onClick={() => setNotesExpanded(true)}
                                            className="text-[12px] text-text3 hover:text-text2 transition-colors"
                                        >
                                            See more
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setNotesExpanded(true)}
                                        className="text-[12px] font-medium text-text2 hover:text-text transition-colors"
                                    >
                                        + Add note
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3 bucket lanes */}
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sprintTasksByBucket.map(({ bucket, tasks, done, total }) => {
                        const bucketColor = bucket === 'work' ? '#3B82F6' : bucket === 'learn' ? '#F59E0B' : '#D946EF'
                        const bucketGoal = bucket === 'work' ? sprint.workGoal : bucket === 'learn' ? sprint.learnGoal : sprint.lifeGoal
                        return (
                            <div key={bucket} className="flex flex-col bg-surface/50 border border-border rounded-xl overflow-hidden">
                                {/* Goal header */}
                                <div className="px-4 pt-4 pb-3 border-b border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: bucketColor }} />
                                            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: bucketColor }}>
                                                {bucket === 'life' ? 'Personal' : bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-text3">{done}/{total} done</span>
                                    </div>
                                    {bucketGoal ? (
                                        <p className="text-[13px] text-text leading-relaxed mb-2">{bucketGoal}</p>
                                    ) : (
                                        <p className="text-[13px] text-text3 italic mb-2">No goal set</p>
                                    )}
                                </div>
                                {/* Tasks */}
                                <div className="flex-1 overflow-y-auto px-3 py-2">
                                    {tasks.length === 0 ? (
                                        <div className="text-[13px] text-text3 py-4 text-center">No tasks tagged to sprint</div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {tasks.map((task) => (
                                                <TaskItem key={task.id} task={task} inSprintLane />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>

            <SprintModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveSprint}
            />
            <AddTaskModal
                isOpen={addTaskOpen}
                onClose={() => setAddTaskOpen(false)}
                onSave={handleAddTask}
                hasSprint={true}
                defaultTagToSprint={true}
            />
            <Modal isOpen={endConfirmOpen} onClose={() => setEndConfirmOpen(false)}>
                <h2 className="font-semibold text-[20px] leading-tight text-text mb-2">
                    End sprint?
                </h2>
                <p className="text-[13px] text-text2 leading-relaxed mb-6">
                    You still have{' '}
                    <span className="text-text font-medium">
                        {sprint ? store.tasks.filter((t) => t.sprintId === sprint.id && !t.isDone).length : 0} incomplete task
                        {sprint && store.tasks.filter((t) => t.sprintId === sprint.id && !t.isDone).length !== 1 ? 's' : ''}
                    </span>{' '}
                    in this sprint. What should happen to them?
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleEndSprintDeleteTasks}
                        className="w-full px-4 py-3 rounded-xl bg-red-950/40 border border-red-900/50 text-[13px] font-medium text-red-400 hover:bg-red-950/60 transition-all duration-150 text-left capitalize"
                    >
                        Delete tasks — remove incomplete tasks
                    </button>
                    <button
                        onClick={handleEndSprintUntagTasks}
                        className="w-full px-4 py-3 rounded-xl bg-surface2 border border-border text-[13px] font-medium text-text2 hover:bg-surface3 hover:text-text transition-all duration-150 text-left capitalize"
                    >
                        Keep & untag — move tasks back to backlog
                    </button>
                    <button
                        onClick={() => setEndConfirmOpen(false)}
                        className="w-full px-4 py-3 rounded-xl text-[13px] font-medium text-text3 hover:text-text2 transition-all duration-150 text-left capitalize"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
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
