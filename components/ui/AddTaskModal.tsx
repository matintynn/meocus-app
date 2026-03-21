'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Bucket, Urgency } from '@/lib/types'

const BUCKET_KEY = 'focus_last_bucket'

interface AddTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        title: string
        bucket: Bucket
        urgency: Urgency
        deadline: string | null
        tagToSprint: boolean
    }) => void
    hasSprint: boolean
}

const bucketOptions: { value: Bucket; label: string; bg: string; text: string }[] = [
    { value: 'work', label: 'Work', bg: '#1D3461', text: '#93C5FD' },
    { value: 'learn', label: 'Learn', bg: '#3D2B0A', text: '#FCD34D' },
    { value: 'life', label: 'Personal', bg: '#2E1336', text: '#E879F9' },
]

const urgencyOptions: { value: Urgency; label: string; bg: string; text: string }[] = [
    { value: 'urgent', label: 'Urgent', bg: '#3B1212', text: '#FCA5A5' },
    { value: 'normal', label: 'Normal', bg: '#2C2C2E', text: '#F5F5F7' },
    { value: 'someday', label: 'Someday', bg: '#27272A', text: '#AEAEB2' },
]

export default function AddTaskModal({ isOpen, onClose, onSave, hasSprint }: AddTaskModalProps) {
    const [title, setTitle] = useState('')
    const [bucket, setBucket] = useState<Bucket>('work')
    const [urgency, setUrgency] = useState<Urgency>('normal')
    const [deadline, setDeadline] = useState('')
    const [tagToSprint, setTagToSprint] = useState(false)
    const dateRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(BUCKET_KEY)
            if (saved === 'work' || saved === 'learn' || saved === 'life') {
                setBucket(saved)
            }
        }
    }, [])

    function handleSave() {
        const trimmed = title.trim()
        if (!trimmed) return
        localStorage.setItem(BUCKET_KEY, bucket)
        const todayStr = new Date().toISOString().split('T')[0]
        onSave({ title: trimmed, bucket, urgency, deadline: deadline || todayStr, tagToSprint })
        setTitle('')
        setDeadline('')
        setTagToSprint(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                Add task
            </h2>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
                What do you need to get done?
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
                    placeholder="e.g. Review sprint goals"
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
                    Deadline <span className="text-text3/60 normal-case tracking-normal">(defaults to today)</span>
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

            {/* Tag to sprint */}
            {hasSprint && (
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
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title.trim()}>
                    Add task
                </Button>
            </div>
        </Modal>
    )
}
