'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { Bucket, Urgency } from '@/lib/types'
import { Plus, ChevronRight } from 'lucide-react'

const BUCKET_KEY = 'focus_last_bucket'

export default function QuickAdd() {
    const { addTask, sprint } = useStore()
    const { showToast } = useToast()
    const [title, setTitle] = useState('')
    const [bucket, setBucket] = useState<Bucket>('work')
    const [urgency, setUrgency] = useState<Urgency>('normal')
    const [deadline, setDeadline] = useState('')
    const [tagToSprint, setTagToSprint] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(BUCKET_KEY)
            if (saved === 'work' || saved === 'learn' || saved === 'life') {
                setBucket(saved)
            }
        }
    }, [])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownOpen])

    function handleSubmit() {
        const trimmed = title.trim()
        if (!trimmed) return

        localStorage.setItem(BUCKET_KEY, bucket)

        addTask({
            title: trimmed,
            bucket,
            urgency,
            deadline: deadline || null,
            isPinnedToday: false,
            pinnedDate: null,
            carriedOver: false,
            isDone: false,
            doneAt: null,
            sprintId: tagToSprint && sprint?.isActive ? sprint.id : null,
            notes: '',
        })

        setTitle('')
        setDeadline('')
        setDropdownOpen(false)
        showToast('Task added')
        inputRef.current?.focus()
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
        }
        if (e.key === 'Escape') {
            setTitle('')
            setDropdownOpen(false)
        }
    }

    const bucketDotColor: Record<Bucket, string> = {
        work: '#3B82F6',
        learn: '#F59E0B',
        life: '#D946EF',
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

    return (
        <div className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 md:px-5">
            {/* Row 1: input + buttons */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-surface3 flex items-center justify-center flex-shrink-0">
                    <Plus size={14} color="#F5F5F7" strokeWidth={1.5} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a task…  (Enter to save)"
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-text placeholder:text-text3 min-w-0"
                />

                {/* Desktop: options + date + add inline */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-1.5 bg-surface2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text2 hover:border-border2 transition-all duration-150"
                        >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bucketDotColor[bucket] }} />
                            Options ▾
                        </button>
                        {dropdownOpen && <DropdownPanel
                            bucket={bucket}
                            setBucket={setBucket}
                            urgency={urgency}
                            setUrgency={setUrgency}
                            tagToSprint={tagToSprint}
                            setTagToSprint={setTagToSprint}
                            hasSprint={!!sprint?.isActive}
                            bucketOptions={bucketOptions}
                            urgencyOptions={urgencyOptions}
                        />}
                    </div>

                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-surface2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text2 focus:outline-none focus:border-border2 transition-all duration-150"
                        style={{ colorScheme: 'dark' }}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="bg-text text-bg text-[13px] font-medium rounded-xl px-3.5 py-1.5 hover:opacity-85 transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap inline-flex items-center gap-1"
                    >
                        Add <ChevronRight size={13} />
                    </button>
                </div>
            </div>

            {/* Row 2: Mobile — options + date */}
            <div className="flex md:hidden items-center gap-2 mt-2">
                <div className="relative flex-1" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1.5 bg-surface2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text2 hover:border-border2 transition-all duration-150"
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bucketDotColor[bucket] }} />
                        Options ▾
                    </button>
                    {dropdownOpen && <DropdownPanel
                        bucket={bucket}
                        setBucket={setBucket}
                        urgency={urgency}
                        setUrgency={setUrgency}
                        tagToSprint={tagToSprint}
                        setTagToSprint={setTagToSprint}
                        hasSprint={!!sprint?.isActive}
                        bucketOptions={bucketOptions}
                        urgencyOptions={urgencyOptions}
                    />}
                </div>

                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-surface2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text2 focus:outline-none focus:border-border2 transition-all duration-150"
                    style={{ colorScheme: 'dark' }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="bg-text text-bg text-[13px] font-medium rounded-xl px-3.5 py-1.5 hover:opacity-85 transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap inline-flex items-center gap-1"
                >
                    Add <ChevronRight size={13} />
                </button>
            </div>
        </div>
    )
}

// ─── Dropdown Panel ──────────────────────────────────

interface DropdownPanelProps {
    bucket: Bucket
    setBucket: (b: Bucket) => void
    urgency: Urgency
    setUrgency: (u: Urgency) => void
    tagToSprint: boolean
    setTagToSprint: (v: boolean) => void
    hasSprint: boolean
    bucketOptions: { value: Bucket; label: string; bg: string; text: string }[]
    urgencyOptions: { value: Urgency; label: string; bg: string; text: string }[]
}

function DropdownPanel({
    bucket,
    setBucket,
    urgency,
    setUrgency,
    tagToSprint,
    setTagToSprint,
    hasSprint,
    bucketOptions,
    urgencyOptions,
}: DropdownPanelProps) {
    return (
        <div className="absolute top-full left-0 mt-1 min-w-[220px] bg-surface border border-border2 rounded-xl shadow-lg z-50 p-3">
            <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-2">
                Bucket
            </div>
            <div className="flex gap-1.5 mb-3">
                {bucketOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setBucket(opt.value)}
                        className="flex-1 text-[12px] font-medium py-1.5 rounded-lg text-center transition-all duration-150"
                        style={{
                            backgroundColor: bucket === opt.value ? opt.bg : '#2C2C2E',
                            color: bucket === opt.value ? opt.text : '#AEAEB2',
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="h-px bg-border my-2" />

            <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-2">
                Urgency
            </div>
            <div className="flex gap-1.5 mb-3">
                {urgencyOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setUrgency(opt.value)}
                        className="flex-1 text-[12px] font-medium py-1.5 rounded-lg text-center transition-all duration-150"
                        style={{
                            backgroundColor: urgency === opt.value ? opt.bg : '#2C2C2E',
                            color: urgency === opt.value ? opt.text : '#AEAEB2',
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {hasSprint && (
                <>
                    <div className="h-px bg-border my-2" />
                    <div className="text-[11px] font-medium text-text3 uppercase tracking-wider mb-2">
                        Add to sprint
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={tagToSprint}
                            onChange={(e) => setTagToSprint(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-learn"
                        />
                        <span className="text-[12px] text-text2">Tag to active sprint</span>
                    </label>
                </>
            )}
        </div>
    )
}
