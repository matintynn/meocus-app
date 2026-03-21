'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { useStore } from '@/lib/store'
import Checkbox from '@/components/ui/Checkbox'
import Tag from '@/components/ui/Tag'
import { formatDeadline, isOverdue, isToday } from '@/lib/utils/dates'

interface TaskItemProps {
    task: Task
    showPinButton?: boolean
    showCarriedActions?: boolean
}

export default function TaskItem({
    task,
    showPinButton = false,
    showCarriedActions = false,
}: TaskItemProps) {
    const { toggleDone, deleteTask, pinTask, unpinTask, dismissCarriedOver } = useStore()
    const [removing, setRemoving] = useState(false)

    const isUrgent = task.urgency === 'urgent'
    const isSomeday = task.urgency === 'someday'
    const isCarried = task.carriedOver
    const overdue = isOverdue(task.deadline)
    const dueToday = task.deadline ? isToday(task.deadline) : false

    function handleToggleDone() {
        if (!task.isDone) {
            setRemoving(true)
            setTimeout(() => toggleDone(task.id), 300)
        } else {
            toggleDone(task.id)
        }
    }

    function handlePin() {
        pinTask(task.id)
    }

    function handleUnpin() {
        unpinTask(task.id)
    }

    // Deadline chip color
    function getDeadlineStyle(): { backgroundColor: string; color: string } {
        if (overdue) return { backgroundColor: '#3B1212', color: '#FCA5A5' }
        if (dueToday) return { backgroundColor: '#1A2A1A', color: '#86EFAC' }
        return { backgroundColor: '#3A3A3C', color: '#AEAEB2' }
    }

    // Row background + border
    let rowBg = ''
    let leftBorder = ''
    let leftBorderColor = ''

    if (isUrgent && !task.isDone) {
        rowBg = 'rgba(59, 18, 18, 0.3)'
        leftBorder = '2px solid #EF4444'
        leftBorderColor = 'rounded-l-none'
    }

    if (isCarried && !task.isDone) {
        rowBg = 'rgba(41, 32, 8, 0.4)'
        leftBorder = '2px solid #D97706'
        leftBorderColor = 'rounded-l-none'
    }

    return (
        <div
            className={`
        group flex items-start gap-3 min-h-[48px] px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/[0.04]
        ${leftBorderColor}
        ${isSomeday && !task.isDone ? 'opacity-60' : ''}
        ${removing ? 'opacity-0 -translate-y-2' : ''}
      `}
            style={{
                backgroundColor: rowBg || undefined,
                borderLeft: leftBorder || undefined,
                animation: 'taskIn 0.2s ease',
            }}
        >
            {/* Checkbox */}
            <div className="mt-0.5 relative z-10">
                <Checkbox checked={task.isDone} onChange={handleToggleDone} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div
                    className={`text-[14px] leading-relaxed ${task.isDone ? 'line-through text-text3' : 'text-text'
                        } transition-all duration-200`}
                >
                    {task.title}
                </div>
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {task.deadline && (
                        <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded"
                            style={getDeadlineStyle()}
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                                <circle cx="6" cy="6" r="4.5" />
                                <path d="M6 3.5V6L7.5 7.5" />
                            </svg>
                            {formatDeadline(task.deadline)}
                        </span>
                    )}
                    <Tag variant={task.bucket} label={task.bucket === 'life' ? 'Personal' : task.bucket.charAt(0).toUpperCase() + task.bucket.slice(1)} size="sm" />
                    {task.sprintId && <Tag variant="sprint" label="Sprint" size="sm" />}
                    {task.urgency !== 'normal' && (
                        <Tag variant={task.urgency} label={task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)} size="sm" />
                    )}
                    {isCarried && <Tag variant="carried" label="↩ carried" size="sm" />}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 mt-0.5 flex-shrink-0">
                {showCarriedActions && (
                    <>
                        <button
                            onClick={handlePin}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-surface2 border border-border text-text2 hover:bg-surface3 hover:text-text transition-all duration-150 active:scale-[0.98]"
                        >
                            Move to today
                        </button>
                        <button
                            onClick={() => dismissCarriedOver(task.id)}
                            className="text-[11px] font-medium px-2 py-1 rounded-lg text-text3 hover:text-text2 transition-all duration-150"
                        >
                            Dismiss
                        </button>
                    </>
                )}

                {!showCarriedActions && (
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                        {showPinButton && !task.isPinnedToday && !task.isDone && (
                            <button
                                onClick={handlePin}
                                className="h-7 flex items-center gap-1 px-2 rounded-lg bg-transparent border border-border text-[11px] font-medium text-text3 hover:bg-surface2 hover:border-border2 hover:text-text transition-all duration-150 active:scale-[0.98]"
                                title="Move to today"
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M2 6h8M7 3l3 3-3 3" />
                                </svg>
                                Today
                            </button>
                        )}
                        {task.isPinnedToday && !task.isDone && (
                            <button
                                onClick={handleUnpin}
                                className="h-7 flex items-center gap-1 px-2 rounded-lg bg-transparent border border-border text-[11px] font-medium text-text3 hover:bg-surface2 hover:border-border2 hover:text-text transition-all duration-150 active:scale-[0.98]"
                                title="Move back to this week"
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M10 6H2M5 3L2 6l3 3" />
                                </svg>
                                Back
                            </button>
                        )}
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent border border-border text-text3 hover:bg-surface2 hover:border-border2 hover:text-text transition-all duration-150 active:scale-[0.98]"
                            title="Delete"
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M3 3L9 9M9 3L3 9" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes taskIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}
