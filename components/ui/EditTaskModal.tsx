'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Bucket, Urgency, Task, Sprint } from '@/lib/types'

interface EditTaskModalProps {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, updates: { title: string; bucket: Bucket; urgency: Urgency; deadline: string | null; notes: string; sprintId: string | null }) => void
    activeSprint?: Sprint | null
}

const bucketOptions: { value: Bucket; label: string; bg: string; text: string }[] = [
    { value: 'work', label: 'Work', bg: '#1D3461', text: '#93C5FD' },
    { value: 'learn', label: 'Learn', bg: '#3D2B0A', text: '#FCD34D' },
    { value: 'life', label: 'Personal', bg: '#2E1336', text: '#E879F9' },
]

const urgencyOptions: { value: Urgency; label: string; bg: string; text: string }[] = [
    { value: 'urgent', label: 'Urgent', bg: '#3B1212', text: '#FCA5A5' },
    { value: 'normal', label: 'Major', bg: '#2C2C2E', text: '#F5F5F7' },
    { value: 'someday', label: 'Later', bg: '#27272A', text: '#AEAEB2' },
]

export default function EditTaskModal({ task, isOpen, onClose, onSave, activeSprint = null }: EditTaskModalProps) {
    const [title, setTitle] = useState('')
    const [bucket, setBucket] = useState<Bucket>('work')
    const [urgency, setUrgency] = useState<Urgency>('normal')
    const [deadline, setDeadline] = useState('')
    const [notes, setNotes] = useState('')
    const [tagToSprint, setTagToSprint] = useState(false)
    const dateRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setBucket(task.bucket)
            setUrgency(task.urgency)
            setDeadline(task.deadline ?? '')
            setNotes(task.notes ?? '')
            setTagToSprint(!!task.sprintId)
        }
    }, [task])

    function handleSave() {
        const trimmed = title.trim()
        if (!trimmed || !task) return
        onSave(task.id, {
            title: trimmed,
            bucket,
            urgency,
            deadline: deadline || null,
            notes,
            sprintId: tagToSprint ? (activeSprint?.id ?? task.sprintId ?? null) : null,
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                Edit task
            </h2>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
                Update the details for this task.
            </p>

            {/* Title */}
            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Task
                </span>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                    autoFocus
                />
            </label>

            {/* Bucket */}
            <div className="mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Bucket
                </span>
                <div className="flex gap-1.5">
                    {bucketOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setBucket(opt.value)}
                            className="flex-1 text-[12px] font-medium py-2 rounded-lg text-center transition-all duration-150"
                            style={{
                                backgroundColor: bucket === opt.value ? opt.bg : '#2C2C2E',
                                color: bucket === opt.value ? opt.text : '#AEAEB2',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Urgency */}
            <div className="mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Urgency
                </span>
                <div className="flex gap-1.5">
                    {urgencyOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setUrgency(opt.value)}
                            className="flex-1 text-[12px] font-medium py-2 rounded-lg text-center transition-all duration-150"
                            style={{
                                backgroundColor: urgency === opt.value ? opt.bg : '#2C2C2E',
                                color: urgency === opt.value ? opt.text : '#AEAEB2',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Deadline */}
            <div className="mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Deadline
                </span>
                <div
                    className="relative w-full cursor-pointer"
                    onClick={() => dateRef.current?.showPicker?.()}
                >
                    <input
                        ref={dateRef}
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text focus:border-border2 focus:outline-none cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>

            {/* Notes */}
            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Notes <span className="text-text3/60 normal-case tracking-normal">(optional)</span>
                </span>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Any extra context..."
                />
            </label>

            {/* Tag to sprint */}
            {activeSprint && (
                <label className="flex items-center gap-2 cursor-pointer mb-5">
                    <input
                        type="checkbox"
                        checked={tagToSprint}
                        onChange={(e) => setTagToSprint(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-learn"
                    />
                    <span className="text-[13px] text-text2">Tag to active sprint</span>
                </label>
            )}

            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title.trim()}>
                    Save changes
                </Button>
            </div>
        </Modal>
    )
}
