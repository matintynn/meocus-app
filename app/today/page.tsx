'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import AddTaskModal from '@/components/ui/AddTaskModal'
import TaskItem from '@/components/tasks/TaskItem'
import { Plus, ChevronRight, X } from 'lucide-react'
import CheckinModal from '@/components/ui/CheckinModal'
import Button from '@/components/ui/Button'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { formatFullDate, toDateString, formatWeekRange, daysRemaining, getSprintProgress } from '@/lib/utils/dates'
import type { Sprint } from '@/lib/types'

function TodayContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [showAllToday, setShowAllToday] = useState(false)
    const [checkinOpen, setCheckinOpen] = useState(false)
    const [addTaskOpen, setAddTaskOpen] = useState(false)
    const [bannerDismissed, setBannerDismissed] = useState(false)
    const [showDoneLane, setShowDoneLane] = useState(false)

    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const tick = () => setNow(new Date())
        // align to the next full minute, then tick every 60s
        const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000
        const timeout = setTimeout(() => {
            tick()
            const interval = setInterval(tick, 60_000)
            return () => clearInterval(interval)
        }, msUntilNextMinute)
        return () => clearTimeout(timeout)
    }, [])
    const hour = now.getHours()

    // Show notification banner at/after 10 PM if no check-in today and not dismissed
    const showCheckinBanner = hour >= 22 && !store.hasCheckedInToday && !bannerDismissed
    let greeting = 'Good evening.'
    if (hour >= 5 && hour < 12) greeting = 'Good morning.'
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon.'

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '')
    const dateStr = `${dayNames[now.getDay()]} ${monthNames[now.getMonth()]} ${now.getDate()}`

    const todayAll = useMemo(() => {
        return [...store.todayUnpinned, ...store.todayPinned]
    }, [store.todayPinned, store.todayUnpinned])

    // Custom ordering for Today lane (persists drag reorder within session)
    const [todayOrder, setTodayOrder] = useState<string[]>([])
    const prevIdsRef = useRef<string>('')

    // Sync todayOrder when tasks are added/removed, preserving custom order
    useEffect(() => {
        const currentIds = todayAll.map(t => t.id)
        const currentKey = currentIds.join(',')
        if (currentKey === prevIdsRef.current) return
        prevIdsRef.current = currentKey

        setTodayOrder(prev => {
            // Keep existing order for tasks still present, append new ones at bottom
            const kept = prev.filter(id => currentIds.includes(id))
            const added = currentIds.filter(id => !prev.includes(id))
            return [...kept, ...added]
        })
    }, [todayAll])

    const orderedToday = useMemo(() => {
        const taskMap = new Map(todayAll.map(t => [t.id, t]))
        return todayOrder.map(id => taskMap.get(id)).filter(Boolean) as typeof todayAll
    }, [todayAll, todayOrder])

    const todayCount = orderedToday.length

    const doneTodayTasks = useMemo(() => {
        const todayStr = toDateString(new Date())
        return store.tasks.filter(
            (t) => t.isDone && t.doneAt && toDateString(new Date(t.doneAt)) === todayStr
        )
    }, [store.tasks])

    const doneToday = doneTodayTasks.length

    const displayedToday = showAllToday ? orderedToday : orderedToday.slice(0, 6)
    const hiddenCount = orderedToday.length - 6

    function handleSaveCheckin(data: { proud: string; tomorrow: string; notes: string }) {
        store.saveCheckin({
            date: toDateString(new Date()),
            proud: data.proud,
            tomorrow: data.tomorrow,
            notes: data.notes,
        })
        setCheckinOpen(false)
        showToast('Check-in saved')
    }

    function handleAddTask(data: {
        title: string
        bucket: 'work' | 'learn' | 'life'
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

    const onDragEnd = useCallback((result: DropResult) => {
        const { draggableId, source, destination } = result
        if (!destination) return

        // Reorder within Today lane
        if (source.droppableId === 'today' && destination.droppableId === 'today') {
            setTodayOrder(prev => {
                const next = [...prev]
                const fromIndex = next.indexOf(draggableId)
                if (fromIndex === -1) return prev
                next.splice(fromIndex, 1)
                next.splice(destination.index, 0, draggableId)
                return next
            })
            return
        }

        if (source.droppableId === 'thisWeek' && destination.droppableId === 'today') {
            const todayStr = toDateString(new Date())
            store.updateTask(draggableId, {
                deadline: todayStr,
                isPinnedToday: false,
                pinnedDate: null,
                carriedOver: false,
            })
        } else if (source.droppableId === 'today' && destination.droppableId === 'thisWeek') {
            const task = store.tasks.find(t => t.id === draggableId)
            const fallbackDeadline = toDateString(new Date(Date.now() + 86400000))
            store.updateTask(draggableId, {
                deadline: task?.deadline && task.deadline > toDateString(new Date()) ? task.deadline : fallbackDeadline,
                isPinnedToday: false,
                pinnedDate: null,
            })
        }
    }, [store])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ─── Fixed header area ─── */}
            <div className="flex-shrink-0">
                <Topbar
                    title={
                        <div>
                            <h1 className="font-semibold text-[22px] leading-tight text-text">
                                {greeting}
                            </h1>
                            <p className="text-[13px] mt-0.5"><span className="font-semibold text-text2">{timeStr}</span><span className="text-text3 mx-1.5">·</span><span className="text-text3">{dateStr}</span></p>
                        </div>
                    }
                    onMenuClick={toggle}
                    extra={
                        <Button
                            onClick={() => setAddTaskOpen(true)}
                        >
                            <Plus size={14} strokeWidth={1.5} />
                            Add Task
                        </Button>
                    }
                />

                {/* Check-in notification banner */}
                {showCheckinBanner && (
                    <div className="flex items-center gap-3 bg-[#2a2520] border border-[#3d3328] rounded-xl px-4 py-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#f0b060] flex-shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                            <span className="text-[14px] text-text font-medium">Time to reflect</span>
                            <span className="text-[13px] text-text2 ml-1.5">— close the day with a quick check-in</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => setBannerDismissed(true)}
                                className="text-[13px] text-text3 hover:text-text2 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setCheckinOpen(true)}
                                className="text-[13px] font-medium text-[#f0b060] hover:text-[#f5c580] transition-colors"
                            >
                                <span className="flex items-center gap-1">Reflect now <ChevronRight size={12} /></span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Carried over section */}
                {store.carriedOver.length > 0 && (
                    <section className="mb-4">
                        <SectionHeader
                            label="CARRIED OVER"
                            count={store.carriedOver.length}
                        />
                        <div className="flex flex-col gap-1">
                            {store.carriedOver.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    showCarriedActions
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ─── Kanban lanes ─── */}
            <DragDropContext onDragEnd={onDragEnd}>
                {todayCount === 0 && store.thisWeekTasks.length === 0 && doneToday === 0 ? (
                    /* Empty state — nudge to add first task */
                    <div className="flex-1 min-h-0">
                        <div className="h-full bg-surface/50 rounded-xl border border-border flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-[15px] text-text2 font-medium mb-1">No tasks yet</div>
                                <div className="text-[13px] text-text3 mb-4">Start by adding your first task</div>
                                <Button onClick={() => setAddTaskOpen(true)}>
                                    <Plus size={14} strokeWidth={1.5} />
                                    Add Task
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`flex-1 min-h-0 grid grid-cols-1 gap-4 ${(store.thisWeekTasks.length > 0 && showDoneLane) ? 'md:grid-cols-3' : (store.thisWeekTasks.length > 0 || showDoneLane) ? 'md:grid-cols-2' : ''}`}>
                        {/* Lane 1: Today */}
                        <div className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
                            <div className="flex-shrink-0 px-4 pt-3 pb-2">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">Today</span>
                                        <span className="bg-surface3 text-text font-semibold text-[10px] px-1.5 py-px rounded-full">{todayCount}</span>
                                    </div>
                                    {doneToday > 0 && !showDoneLane && (
                                        <button
                                            onClick={() => setShowDoneLane(true)}
                                            className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
                                        >
                                            <span className="bg-green-900/60 text-green-400 font-semibold text-[10px] px-1.5 py-px rounded-full">{doneToday}</span>
                                            <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">Done</span>
                                            <ChevronRight size={12} className="text-text3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Droppable droppableId="today">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 overflow-y-auto px-3 pb-3 transition-colors duration-150 ${snapshot.isDraggingOver ? 'bg-surface/80 rounded-b-xl' : ''}`}
                                    >
                                        {todayCount === 0 && !snapshot.isDraggingOver ? (
                                            <div className="py-8 text-center">
                                                <div className="text-[14px] text-text2">Nothing scheduled</div>
                                                <div className="text-[13px] text-text3 mt-1">
                                                    {store.thisWeekTasks.length > 0 ? 'Drag a task from Coming Up →' : 'Add a task to get started'}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-col gap-1">
                                                    {displayedToday.map((task, index) => {
                                                        const isPinned = store.todayPinned.includes(task)
                                                        return (
                                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                {(dragProvided, dragSnapshot) => (
                                                                    <div
                                                                        ref={dragProvided.innerRef}
                                                                        {...dragProvided.draggableProps}
                                                                        {...dragProvided.dragHandleProps}
                                                                        className={dragSnapshot.isDragging ? 'opacity-90 shadow-lg rounded-xl' : ''}
                                                                    >
                                                                        <TaskItem
                                                                            task={task}
                                                                            showPinButton={!isPinned}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    })}
                                                </div>
                                                {!showAllToday && hiddenCount > 0 && (
                                                    <button
                                                        onClick={() => setShowAllToday(true)}
                                                        className="text-[13px] text-text3 hover:text-text2 mt-2 ml-1 transition-colors duration-150"
                                                    >
                                                        Show {hiddenCount} more
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>

                        {/* Lane 2: Done today */}
                        {showDoneLane && doneToday > 0 && (
                            <div className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
                                <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center justify-between gap-2">
                                    <SectionHeader
                                        label="DONE TODAY"
                                        count={doneToday}
                                    />
                                    <button
                                        onClick={() => setShowDoneLane(false)}
                                        className="w-5 h-5 flex items-center justify-center rounded-md text-text3 hover:bg-surface2 hover:text-text transition-all flex-shrink-0"
                                        title="Close"
                                    >
                                        <X size={12} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-3 pb-3">
                                    <div className="flex flex-col gap-1">
                                        {doneTodayTasks.map((task) => (
                                            <TaskItem key={task.id} task={task} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lane 3: Coming Up — only when non-today tasks exist */}
                        {store.thisWeekTasks.length > 0 && (
                            <div className="flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border">
                                <div className="flex-shrink-0 px-4 pt-3 pb-2">
                                    <SectionHeader
                                        label="COMING UP"
                                        count={store.thisWeekTasks.length}
                                    />
                                </div>
                                <Droppable droppableId="thisWeek">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto px-3 pb-3 transition-colors duration-150 ${snapshot.isDraggingOver ? 'bg-surface/80 rounded-b-xl' : ''}`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                {store.thisWeekTasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(dragProvided, dragSnapshot) => (
                                                            <div
                                                                ref={dragProvided.innerRef}
                                                                {...dragProvided.draggableProps}
                                                                {...dragProvided.dragHandleProps}
                                                                className={dragSnapshot.isDragging ? 'opacity-90 shadow-lg rounded-xl' : ''}
                                                            >
                                                                <TaskItem
                                                                    task={task}
                                                                    showPinButton
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )}
                    </div>
                )}
            </DragDropContext>

            {/* Check-in modal */}
            <CheckinModal
                isOpen={checkinOpen}
                onClose={() => setCheckinOpen(false)}
                onSave={handleSaveCheckin}
            />

            {/* Add task modal */}
            <AddTaskModal
                isOpen={addTaskOpen}
                onClose={() => setAddTaskOpen(false)}
                onSave={handleAddTask}
                hasSprint={!!store.sprint?.isActive}
            />
        </div>
    )
}

// ─── Sub-components ──────────────────────────────────

function StatCard({
    label,
    value,
    highlight = false,
}: {
    label: string
    value: number
    highlight?: boolean
}) {
    return (
        <div className="flex-1 min-w-0 bg-surface border border-border rounded-xl px-3.5 py-3">
            <div
                className={`font-semibold text-[20px] leading-tight ${highlight ? 'text-urgent' : 'text-text'
                    }`}
            >
                {value}
            </div>
            <div className="text-[11px] text-text3 mt-0.5">{label}</div>
        </div>
    )
}

function SprintStatCard({ sprint }: { sprint: Sprint | null }) {
    if (!sprint || !sprint.isActive) {
        return (
            <div className="bg-surface border border-border rounded-xl px-3.5 py-2">
                <div className="text-[13px] text-text3">No sprint</div>
                <div className="text-[11px] text-text3 mt-0.5">Active sprint</div>
            </div>
        )
    }

    const days = daysRemaining(sprint.endDate)

    return (
        <div className="bg-surface border border-border rounded-xl px-3.5 py-2 flex items-center gap-2">
            <span className="text-[13px] text-text3">Active sprint</span>
            <span className="text-text3 mx-0.5">·</span>
            <span className="text-[13px] text-text font-medium">{days} days left</span>
        </div>
    )
}

function SectionHeader({
    label,
    extra,
    count,
}: {
    label: string
    extra?: string
    count?: number
}) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-medium text-text3 uppercase tracking-wider">
                {label}
            </span>
            {extra && (
                <span className="text-[11px] text-text3">{extra}</span>
            )}
            {count !== undefined && (
                <span className="bg-surface3 text-text font-semibold text-[10px] px-1.5 py-px rounded-full">
                    {count}
                </span>
            )}

        </div>
    )
}

// ─── Page wrapper ────────────────────────────────────

export default function TodayPage() {
    return (
        <AppShell>
            <TodayContent />
        </AppShell>
    )
}
