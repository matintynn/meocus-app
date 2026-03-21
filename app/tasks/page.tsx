'use client'

import { useState, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import AddTaskModal from '@/components/ui/AddTaskModal'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskItem from '@/components/tasks/TaskItem'
import Button from '@/components/ui/Button'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { Bucket } from '@/lib/types'
import { daysSince } from '@/lib/utils/dates'

function TasksContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [showDone, setShowDone] = useState(false)
    const [addTaskOpen, setAddTaskOpen] = useState(false)

    const workTasks = useMemo(() => store.tasks.filter((t) => !t.isDone && t.bucket === 'work'), [store.tasks])
    const learnTasks = useMemo(() => store.tasks.filter((t) => !t.isDone && t.bucket === 'learn'), [store.tasks])
    const lifeTasks = useMemo(() => store.tasks.filter((t) => !t.isDone && t.bucket === 'life'), [store.tasks])

    // Done tasks grouped by date
    const doneGrouped = useMemo(() => {
        const groups: { label: string; tasks: typeof store.doneTasks }[] = []
        const groupMap = new Map<string, typeof store.doneTasks>()

        for (const task of store.doneTasks) {
            const dateStr = task.doneAt ? task.doneAt.split('T')[0] : 'Unknown'
            const d = daysSince(dateStr)
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
    }, [store.doneTasks])

    function handleDeleteAllDone() {
        store.doneTasks.forEach((t) => store.deleteTask(t.id))
        showToast('All done tasks deleted')
    }

    function handleAddTask(data: {
        title: string
        bucket: Bucket
        urgency: 'urgent' | 'normal' | 'someday'
        deadline: string | null
        tagToSprint: boolean
    }) {
        store.addTask({
            title: data.title,
            bucket: data.bucket,
            urgency: data.urgency,
            deadline: data.deadline,
            isPinnedToday: false,
            pinnedDate: null,
            carriedOver: false,
            isDone: false,
            doneAt: null,
            sprintId: data.tagToSprint && store.sprint?.isActive ? store.sprint.id : null,
        })
        setAddTaskOpen(false)
        showToast('Task added')
    }

    const bucketLanes: { label: string; color: string; tasks: typeof workTasks }[] = [
        { label: 'Work', color: '#3B82F6', tasks: workTasks },
        { label: 'Learn', color: '#F59E0B', tasks: learnTasks },
        { label: 'Personal', color: '#D946EF', tasks: lifeTasks },
    ]

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 mt-4">
                <Topbar
                    title={
                        <h1 className="font-semibold text-[22px] leading-tight text-text">
                            All tasks
                        </h1>
                    }
                    onMenuClick={toggle}
                    extra={
                        <button
                            onClick={() => setAddTaskOpen(true)}
                            className="inline-flex items-center gap-1.5 bg-text text-bg text-[13px] font-medium rounded-xl px-4 py-2 hover:opacity-85 transition-all duration-150 active:scale-[0.98]"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M7 3v8M3 7h8" />
                            </svg>
                            Add Task
                        </button>
                    }
                />

                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setShowDone(false)}
                        className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${!showDone ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setShowDone(true)}
                        className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${showDone ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                    >
                        Done ({store.doneTasks.length})
                    </button>
                </div>
            </div>

            {showDone ? (
                <div className="flex-1 overflow-y-auto">
                    <DoneTasksView
                        groups={doneGrouped}
                        totalCount={store.doneTasks.length}
                        onDeleteAll={handleDeleteAllDone}
                    />
                </div>
            ) : (
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bucketLanes.map((lane) => (
                        <div key={lane.label} className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
                            <div className="flex-shrink-0 px-4 pt-3 pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lane.color }} />
                                    <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">
                                        {lane.label}
                                    </span>
                                    <span className="bg-surface3 text-text3 text-[10px] px-1.5 py-px rounded-full">
                                        {lane.tasks.length}
                                    </span>
                                    <div className="flex-1 h-px bg-border ml-1" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-3 pb-3">
                                {lane.tasks.length === 0 ? (
                                    <div className="py-6 text-center">
                                        <div className="text-[13px] text-text3">No {lane.label.toLowerCase()} tasks</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {lane.tasks.map((task) => (
                                            <TaskItem key={task.id} task={task} showPinButton />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddTaskModal
                isOpen={addTaskOpen}
                onClose={() => setAddTaskOpen(false)}
                onSave={handleAddTask}
                hasSprint={!!store.sprint?.isActive}
            />
        </div>
    )
}

function DoneTasksView({
    groups,
    totalCount,
    onDeleteAll,
}: {
    groups: { label: string; tasks: import('@/lib/types').Task[] }[]
    totalCount: number
    onDeleteAll: () => void
}) {
    if (totalCount === 0) {
        return (
            <div className="py-8 text-center">
                <div className="text-[14px] text-text2">No completed tasks</div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] text-text2">
                    {totalCount} completed task{totalCount !== 1 ? 's' : ''}
                </span>
                <Button
                    variant="ghost"
                    className="text-[12px] !px-3 !py-1 hover:!text-urgent"
                    onClick={onDeleteAll}
                >
                    Delete all
                </Button>
            </div>

            {groups.map((group) => (
                <div key={group.label} className="mb-5">
                    <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-2 ml-1">
                        {group.label}
                    </div>
                    <div className="flex flex-col gap-1">
                        {group.tasks.map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function TasksPage() {
    return (
        <AppShell>
            <TasksContent />
        </AppShell>
    )
}
