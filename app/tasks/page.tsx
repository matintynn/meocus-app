'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
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
import { daysSince, isToday, toDateString } from '@/lib/utils/dates'
import { Plus, Layers, Check } from 'lucide-react'

function TasksContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'done'>('today')
    const [addTaskOpen, setAddTaskOpen] = useState(false)
    const [visibleLanes, setVisibleLanes] = useState<Set<Bucket>>(() => new Set<Bucket>(['work', 'learn', 'life']))
    const [viewOpen, setViewOpen] = useState(false)
    const [confettiHoldLanes, setConfettiHoldLanes] = useState<Set<Bucket>>(() => new Set<Bucket>())
    const viewRef = useRef<HTMLDivElement>(null)
    const prevConfettiKeyRef = useRef(store.confettiKey)

    // Keep lane alive for the duration of the confetti animation (3600ms)
    useEffect(() => {
        if (store.confettiKey === 0) return
        if (store.confettiKey === prevConfettiKeyRef.current) return
        prevConfettiKeyRef.current = store.confettiKey
        const bucket = store.confettiBucket as Bucket | null
        if (!bucket) return
        setConfettiHoldLanes(prev => { const next = new Set(prev); next.add(bucket); return next })
        const t = setTimeout(() => {
            setConfettiHoldLanes(prev => { const next = new Set(prev); next.delete(bucket); return next })
        }, 3600)
        return () => clearTimeout(t)
    }, [store.confettiKey, store.confettiBucket])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
                setViewOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function toggleLane(bucket: Bucket) {
        setVisibleLanes(prev => {
            // Always keep at least 1 lane visible
            if (prev.has(bucket) && prev.size === 1) return prev
            const next = new Set(prev)
            next.has(bucket) ? next.delete(bucket) : next.add(bucket)
            return next
        })
    }

    // Per-lane ordering state (persists reorder within session)
    const bucketKeys: Bucket[] = ['work', 'learn', 'life']
    const [laneOrders, setLaneOrders] = useState<Record<Bucket, string[]>>({ work: [], learn: [], life: [] })
    const prevIdsRef = useRef<Record<Bucket, string>>({ work: '', learn: '', life: '' })

    const openTasksByBucket = useMemo(() => {
        const result: Record<Bucket, typeof store.tasks> = { work: [], learn: [], life: [] }
        for (const t of store.tasks) {
            if (!t.isDone && (t.bucket === 'work' || t.bucket === 'learn' || t.bucket === 'life')) {
                result[t.bucket].push(t)
            }
        }
        return result
    }, [store.tasks])

    const todayTasksByBucket = useMemo(() => {
        const todayStr = toDateString(new Date())
        const result: Record<Bucket, typeof store.tasks> = { work: [], learn: [], life: [] }
        for (const t of store.tasks) {
            if (t.isDone) continue
            if (t.bucket !== 'work' && t.bucket !== 'learn' && t.bucket !== 'life') continue
            const pinnedToday = t.isPinnedToday && t.pinnedDate === todayStr
            const deadlineToday = !t.isPinnedToday && !t.carriedOver && t.deadline !== null && isToday(t.deadline)
            if (pinnedToday || deadlineToday) {
                result[t.bucket].push(t)
            }
        }
        return result
    }, [store.tasks])

    // Upcoming tasks in the next 3 days (for "all done today" suggestion list)
    const next3DaysTasks = useMemo(() => {
        const todayStr = toDateString(new Date())
        const d3 = new Date(); d3.setDate(d3.getDate() + 3)
        const d3Str = toDateString(d3)
        const urgencyOrder = { urgent: 0, normal: 1, someday: 2 }
        return store.tasks
            .filter(t => {
                if (t.isDone) return false
                if (t.carriedOver) return false
                if (t.bucket !== 'work' && t.bucket !== 'learn' && t.bucket !== 'life') return false
                const pinnedToday = t.isPinnedToday && t.pinnedDate === todayStr
                const deadlineToday = !t.isPinnedToday && !t.carriedOver && t.deadline !== null && isToday(t.deadline)
                if (pinnedToday || deadlineToday) return false
                // Include if deadline is within next 3 days, or urgent with no deadline
                if (t.deadline && t.deadline > todayStr && t.deadline <= d3Str) return true
                if (!t.deadline && t.urgency === 'urgent') return true
                return false
            })
            .sort((a, b) => {
                if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
                if (a.deadline) return -1
                if (b.deadline) return 1
                return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
            })
            .slice(0, 5)
    }, [store.tasks])

    const upcomingTasksByBucket = useMemo(() => {
        const todayStr = toDateString(new Date())
        const result: Record<Bucket, typeof store.tasks> = { work: [], learn: [], life: [] }
        for (const t of store.tasks) {
            if (t.isDone) continue
            if (t.bucket !== 'work' && t.bucket !== 'learn' && t.bucket !== 'life') continue
            const pinnedToday = t.isPinnedToday && t.pinnedDate === todayStr
            const deadlineToday = !t.isPinnedToday && !t.carriedOver && t.deadline !== null && isToday(t.deadline)
            if (!pinnedToday && !deadlineToday) {
                result[t.bucket].push(t)
            }
        }
        return result
    }, [store.tasks])

    // Sync lane orders when tasks are added/removed externally
    useEffect(() => {
        const changed: Bucket[] = []
        const newOrderMap: Partial<Record<Bucket, string[]>> = {}

        for (const bucket of bucketKeys) {
            const currentIds = openTasksByBucket[bucket].map(t => t.id)
            const key = currentIds.join(',')
            if (key === prevIdsRef.current[bucket]) continue
            prevIdsRef.current[bucket] = key
            changed.push(bucket)
            newOrderMap[bucket] = currentIds
        }

        if (changed.length === 0) return

        setLaneOrders(prev => {
            const next = { ...prev }
            for (const bucket of changed) {
                const currentIds = newOrderMap[bucket]!
                const kept = prev[bucket].filter(id => currentIds.includes(id))
                const added = currentIds.filter(id => !prev[bucket].includes(id))
                next[bucket] = [...kept, ...added]
            }
            return next
        })
    }, [openTasksByBucket])

    const orderedTasksByBucket = useMemo(() => {
        const result: Record<Bucket, typeof store.tasks> = { work: [], learn: [], life: [] }
        const sourceByBucket = activeTab === 'today' ? todayTasksByBucket : upcomingTasksByBucket
        for (const bucket of bucketKeys) {
            const taskMap = new Map(sourceByBucket[bucket].map(t => [t.id, t]))
            // keep master order, filter to only ids in current source
            const ordered = laneOrders[bucket].map(id => taskMap.get(id)).filter(Boolean) as typeof store.tasks
            result[bucket] = ordered
        }
        return result
    }, [openTasksByBucket, todayTasksByBucket, upcomingTasksByBucket, laneOrders, activeTab])

    // Done tasks grouped by date
    const doneGrouped = useMemo(() => {
        const groups: { label: string; tasks: typeof store.doneTasks }[] = []
        const groupMap = new Map<string, typeof store.doneTasks>()

        for (const task of store.doneTasks) {
            const d = task.doneAt ? daysSince(task.doneAt) : 0
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
        if (!confirm('Delete all completed tasks? This cannot be undone.')) return
        store.doneTasks.forEach((t) => store.deleteTask(t.id))
        showToast('All done tasks deleted')
    }

    function handleAddTask(data: {
        title: string
        bucket: Bucket
        urgency: 'urgent' | 'normal' | 'someday'
        deadline: string | null
        tagToSprint: boolean
        notes: string
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
            notes: data.notes,
        })
        setAddTaskOpen(false)
        showToast('Task added')
    }

    const todayTotal = useMemo(() => Object.values(todayTasksByBucket).reduce((s, arr) => s + arr.length, 0), [todayTasksByBucket])
    const upcomingTotal = useMemo(() => Object.values(upcomingTasksByBucket).reduce((s, arr) => s + arr.length, 0), [upcomingTasksByBucket])

    const allLanes: { label: string; bucket: Bucket; color: string }[] = [
        { label: 'Work', bucket: 'work', color: '#3B82F6' },
        { label: 'Learn', bucket: 'learn', color: '#F59E0B' },
        { label: 'Personal', bucket: 'life', color: '#D946EF' },
    ]
    const bucketLanes = allLanes.filter(l => visibleLanes.has(l.bucket))

    const activeLanes = useMemo(() => {
        if (activeTab === 'today') return bucketLanes.filter(l => todayTasksByBucket[l.bucket].length > 0 || confettiHoldLanes.has(l.bucket))
        if (activeTab === 'upcoming') return bucketLanes.filter(l => upcomingTasksByBucket[l.bucket].length > 0 || confettiHoldLanes.has(l.bucket))
        return bucketLanes
    }, [activeTab, bucketLanes, todayTasksByBucket, upcomingTasksByBucket, confettiHoldLanes])

    const gridCols = activeLanes.length === 1 ? 'grid-cols-1' : activeLanes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'

    const handleDragEnd = useCallback((result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const srcBucket = source.droppableId as Bucket
        const dstBucket = destination.droppableId as Bucket

        if (srcBucket === dstBucket) {
            // Reorder within same lane
            setLaneOrders(prev => {
                const order = [...prev[srcBucket]]
                order.splice(source.index, 1)
                order.splice(destination.index, 0, draggableId)
                return { ...prev, [srcBucket]: order }
            })
        } else {
            // Move to different lane — update bucket in store
            store.updateTask(draggableId, { bucket: dstBucket })
            // Update both lane orders
            setLaneOrders(prev => {
                const srcOrder = prev[srcBucket].filter(id => id !== draggableId)
                const dstOrder = [...prev[dstBucket]]
                dstOrder.splice(destination.index, 0, draggableId)
                return { ...prev, [srcBucket]: srcOrder, [dstBucket]: dstOrder }
            })
        }
    }, [store])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0">
                <Topbar
                    title={
                        <h1 className="font-semibold text-[22px] leading-tight text-text">
                            All tasks
                        </h1>
                    }
                    onMenuClick={toggle}
                    extra={
                        <Button onClick={() => setAddTaskOpen(true)}>
                            <Plus size={14} strokeWidth={1.5} />
                            Add Task
                        </Button>
                    }
                />

                <div className="flex items-center justify-between mb-4">
                    {/* Today / Upcoming / Done tabs */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`h-[34px] text-[13px] font-medium px-3 rounded-lg transition-all duration-150 ${activeTab === 'today' ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                        >
                            Today ({todayTotal})
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`h-[34px] text-[13px] font-medium px-3 rounded-lg transition-all duration-150 ${activeTab === 'upcoming' ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                        >
                            Upcoming ({upcomingTotal})
                        </button>
                        <button
                            onClick={() => setActiveTab('done')}
                            className={`h-[34px] text-[13px] font-medium px-3 rounded-lg transition-all duration-150 ${activeTab === 'done' ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2'}`}
                        >
                            Done ({store.doneTasks.length})
                        </button>
                    </div>

                    {/* View picker */}
                    {activeTab !== 'done' && (
                        <div className="relative" ref={viewRef}>
                            <button
                                onClick={() => setViewOpen(v => !v)}
                                className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-2 py-1.5 transition-all duration-150 ${viewOpen
                                    ? 'bg-surface2 text-text'
                                    : 'text-text2 hover:text-text'
                                    }`}
                            >
                                <Layers size={13} strokeWidth={1.5} />
                                View
                                {visibleLanes.size < 3 && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface3 text-white text-[10px] font-semibold leading-none">
                                        {visibleLanes.size}
                                    </span>
                                )}
                            </button>

                            {viewOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-[168px] bg-surface border border-border rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                                    {allLanes.map(lane => {
                                        const active = visibleLanes.has(lane.bucket)
                                        return (
                                            <button
                                                key={lane.bucket}
                                                onClick={() => toggleLane(lane.bucket)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-surface2 transition-colors duration-100"
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: lane.color }}
                                                />
                                                <span className={`flex-1 text-left ${active ? 'text-text font-medium' : 'text-text3'}`}>
                                                    {lane.label}
                                                </span>
                                                {active && <Check size={12} strokeWidth={2} className="text-text2 flex-shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'done' ? (
                <div className="flex-1 min-h-0">
                    <DoneTasksView
                        groups={doneGrouped}
                        totalCount={store.doneTasks.length}
                        onDeleteAll={handleDeleteAllDone}
                    />
                </div>
            ) : activeLanes.length === 0 && store.tasks.length === 0 && store.doneTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center pb-[15%] gap-3 text-center">
                    <div className="text-3xl">✨</div>
                    <div className="text-[15px] font-medium text-text">Start fresh</div>
                    <div className="text-[13px] text-text3 max-w-[220px]">
                        Add your first task and get the ball rolling.
                    </div>
                    <Button className="mt-1" onClick={() => setAddTaskOpen(true)}>
                        <Plus size={14} strokeWidth={1.5} />
                        Add Task
                    </Button>
                </div>
            ) : activeLanes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center pb-[15%] gap-3 text-center">
                    <div className="text-3xl">{activeTab === 'today' ? '🎉' : '☀️'}</div>
                    <div className="text-[15px] font-medium text-text">
                        {activeTab === 'today' ? 'All done for today!' : 'Nothing upcoming!'}
                    </div>
                    <div className="text-[13px] text-text3 max-w-[300px]">
                        {activeTab === 'today'
                            ? next3DaysTasks.length > 0
                                ? 'You crushed it. Got extra time? Pull in a few more tasks below.'
                                : 'You crushed it. Nothing urgent coming up — add a new task or pull from Upcoming.'
                            : 'Your plate is clear. A great time to plan ahead.'}
                    </div>
                    {activeTab === 'today' && next3DaysTasks.length > 0 && (
                        <div className="mt-2 w-full max-w-[340px] flex flex-col gap-1.5">
                            <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-0.5">Next 3 days</div>
                            {next3DaysTasks.map(task => {
                                const lane = allLanes.find(l => l.bucket === task.bucket)
                                return (
                                    <div key={task.id} className="flex items-center gap-2.5 bg-surface rounded-lg border border-border px-3 py-2 text-left">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lane?.color }} />
                                        <span className="flex-1 text-[13px] text-text truncate">{task.title}</span>
                                        {task.deadline && (
                                            <span className="text-[11px] text-text3 flex-shrink-0">{task.deadline.slice(5).replace('-', '/')}</span>
                                        )}
                                        <button
                                            onClick={() => store.pinTask(task.id)}
                                            className="flex-shrink-0 text-[11px] font-medium text-text2 hover:text-text bg-surface2 hover:bg-surface3 rounded-md px-2 py-0.5 transition-colors duration-100"
                                        >
                                            Do today
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {activeTab === 'today' && next3DaysTasks.length === 0 && (
                        <div className="mt-1 flex items-center gap-2">
                            <Button onClick={() => setAddTaskOpen(true)}>
                                <Plus size={14} strokeWidth={1.5} />
                                Add Task
                            </Button>
                            {upcomingTotal > 0 && (
                                <Button variant="secondary" onClick={() => setActiveTab('upcoming')}>
                                    View Upcoming
                                </Button>
                            )}
                        </div>
                    )}
                    {activeTab !== 'today' && (
                        <Button className="mt-1" onClick={() => setAddTaskOpen(true)}>
                            <Plus size={14} strokeWidth={1.5} />
                            Add Task
                        </Button>
                    )}
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className={`flex-1 min-h-0 grid grid-cols-1 ${gridCols} gap-4`}>
                        {activeLanes.map((lane) => {
                            const tasks = orderedTasksByBucket[lane.bucket]
                            return (
                                <div key={lane.bucket} id={`lane-${lane.bucket}`} className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
                                    <div className="flex-shrink-0 px-4 pt-3 pb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lane.color }} />
                                            <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">
                                                {lane.label}
                                            </span>
                                            <span className="bg-white font-bold text-text5 text-[10px] px-1.5 py-px rounded-full">
                                                {tasks.length}
                                            </span>
                                        </div>
                                    </div>
                                    <Droppable droppableId={lane.bucket}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 overflow-y-auto px-3 pb-3 transition-colors duration-150 ${snapshot.isDraggingOver ? 'bg-surface2/40' : ''}`}
                                            >
                                                {tasks.length === 0 && !snapshot.isDraggingOver ? (
                                                    <div className="py-6 text-center">
                                                        <div className="text-[13px] text-text3">No {lane.label.toLowerCase()} tasks</div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        {tasks.map((task, index) => (
                                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`transition-opacity duration-150 ${snapshot.isDragging ? 'opacity-80' : ''}`}
                                                                    >
                                                                        <TaskItem task={task} showPinButton />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                    </div>
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )
                        })}
                    </div>
                </DragDropContext>
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
            <div className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
                <div className="flex-shrink-0 px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">Done</span>
                        <span className="bg-surface3 text-text font-semibold text-[10px] px-1.5 py-px rounded-full">0</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center py-8">
                    <div className="text-[14px] text-text2">No completed tasks</div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
            <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">Done</span>
                    <span className="bg-surface3 text-text font-semibold text-[10px] px-1.5 py-px rounded-full">{totalCount}</span>
                </div>
                <Button
                    variant="secondary"
                    className="!text-[13px] !px-3 !py-1.5 hover:!text-urgent"
                    onClick={onDeleteAll}
                >
                    Delete all
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {groups.map((group) => (
                    <div key={group.label} className="mb-4">
                        <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-1.5 ml-1">
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
