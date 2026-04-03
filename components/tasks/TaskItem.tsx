'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { useStore } from '@/lib/store'
import Checkbox from '@/components/ui/Checkbox'
import Tag from '@/components/ui/Tag'
import EditTaskModal from '@/components/ui/EditTaskModal'
import { formatDeadline, isOverdue, isToday } from '@/lib/utils/dates'
import { MoreHorizontal, AlertCircle, Pencil, X, Clock } from 'lucide-react'

interface TaskItemProps {
    task: Task
    showPinButton?: boolean
    showCarriedActions?: boolean
    inSprintLane?: boolean
}

export default function TaskItem({
    task,
    showPinButton = false,
    showCarriedActions = false,
    inSprintLane = false,
}: TaskItemProps) {
    const { toggleDone, deleteTask, pinTask, unpinTask, dismissCarriedOver, updateTask, settings, triggerConfetti, sprint } = useStore()
    const [removing, setRemoving] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [notesOpen, setNotesOpen] = useState(false)

    const isUrgent = task.urgency === 'urgent'
    const isCarried = task.carriedOver
    const overdue = isOverdue(task.deadline)
    const dueToday = task.deadline ? isToday(task.deadline) : false

    function handleToggleDone() {
        if (!task.isDone) {
            if (settings.confettiOnDone) triggerConfetti(task.bucket)
            if (inSprintLane) {
                toggleDone(task.id)
            } else {
                setRemoving(true)
                setTimeout(() => toggleDone(task.id), 300)
            }
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
        ${removing ? 'opacity-0 -translate-y-2' : ''}
        ${task.isDone && inSprintLane ? 'opacity-50' : ''}
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
                {/* Header: title + action buttons */}
                <div className="flex items-start justify-between gap-2">
                    <div
                        className={`text-[14px] leading-relaxed ${task.isDone ? 'line-through text-text3' : 'text-text'
                            } transition-all duration-200`}
                    >
                        {task.title}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
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
                            <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                                {task.notes && !task.isDone && (
                                    <button
                                        onClick={() => setNotesOpen(o => !o)}
                                        className={`w-6 h-6 flex items-center justify-center rounded-md bg-transparent border text-[10px] transition-all duration-150 active:scale-[0.98] ${notesOpen ? 'border-border2 text-text bg-surface2' : 'border-border text-text3 hover:bg-surface2 hover:border-border2 hover:text-text'}`}
                                        title={notesOpen ? 'Hide notes' : 'Show notes'}
                                    >
                                        <MoreHorizontal size={10} />
                                    </button>
                                )}
                                {!task.isDone && (
                                    <>
                                        <button
                                            onClick={() => updateTask(task.id, { urgency: task.urgency === 'urgent' ? 'normal' : 'urgent' })}
                                            className={`w-6 h-6 flex items-center justify-center rounded-md bg-transparent border text-[10px] transition-all duration-150 active:scale-[0.98] ${task.urgency === 'urgent' ? 'border-red-800 text-red-400 bg-red-950/40' : 'border-border text-text3 hover:bg-surface2 hover:border-border2 hover:text-red-400'}`}
                                            title={task.urgency === 'urgent' ? 'Remove urgent' : 'Mark as urgent'}
                                        >
                                            <AlertCircle size={10} />
                                        </button>
                                        <button
                                            onClick={() => setEditOpen(true)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-transparent border border-border text-text3 hover:bg-surface2 hover:border-border2 hover:text-text transition-all duration-150 active:scale-[0.98]"
                                            title="Edit"
                                        >
                                            <Pencil size={10} />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-transparent border border-border text-text3 hover:bg-surface2 hover:border-border2 hover:text-text transition-all duration-150 active:scale-[0.98]"
                                    title="Delete"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description / Notes */}
                {task.notes && !task.isDone && notesOpen && (
                    <p className="text-[12px] text-text3 mt-0.5 leading-relaxed">{task.notes}</p>
                )}

                {/* Tags row */}
                <div className={`flex flex-wrap items-center gap-1.5 mt-1 ${task.isDone ? 'opacity-50' : ''}`}>
                    {task.deadline && (
                        <span
                            className="inline-flex items-center gap-1 font-medium rounded"
                            style={{ ...getDeadlineStyle(), fontSize: '10px', padding: '2px 6px', lineHeight: 1, letterSpacing: '0.02em', whiteSpace: 'nowrap', borderRadius: '4px' }}
                        >
                            <Clock size={8} style={{ flexShrink: 0 }} />
                            {formatDeadline(task.deadline)}
                        </span>
                    )}
                    <Tag variant={task.bucket} label={task.bucket === 'life' ? 'Personal' : task.bucket.charAt(0).toUpperCase() + task.bucket.slice(1)} size="sm" />
                    {task.sprintId && <Tag variant="sprint" label="Sprint" size="sm" />}
                    {task.urgency !== 'someday' && (
                        <Tag variant={task.urgency} label={task.urgency === 'normal' ? 'Major' : 'Urgent'} size="sm" />
                    )}
                    {isCarried && <Tag variant="carried" label="↩ carried" size="sm" />}
                </div>
            </div>

            <style jsx>{`
        @keyframes taskIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <EditTaskModal
                task={task}
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={(id, updates) => updateTask(id, updates)}
                activeSprint={sprint}
            />
        </div>
    )
}
