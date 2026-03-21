'use client'

import { Bucket } from '@/lib/types'

interface TaskFiltersProps {
    activeBuckets: Bucket[]
    onToggleBucket: (bucket: Bucket | 'all') => void
    showDone: boolean
    onToggleDone: () => void
}

const buckets: { value: Bucket | 'all'; label: string; bg: string; text: string; border: string }[] = [
    { value: 'all', label: 'All', bg: '#2C2C2E', text: '#F5F5F7', border: 'rgba(255,255,255,0.18)' },
    { value: 'work', label: 'Work', bg: '#1D3461', text: '#93C5FD', border: 'rgba(59,130,246,0.3)' },
    { value: 'learn', label: 'Learn', bg: '#3D2B0A', text: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
    { value: 'life', label: 'Personal', bg: '#2E1336', text: '#E879F9', border: 'rgba(217,70,239,0.3)' },
]

export default function TaskFilters({
    activeBuckets,
    onToggleBucket,
    showDone,
    onToggleDone,
}: TaskFiltersProps) {
    const allActive = activeBuckets.length === 0

    return (
        <div className="flex items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-1.5 flex-wrap">
                {buckets.map((b) => {
                    const isActive = b.value === 'all' ? allActive : activeBuckets.includes(b.value as Bucket)
                    return (
                        <button
                            key={b.value}
                            onClick={() => onToggleBucket(b.value)}
                            className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.98]"
                            style={{
                                backgroundColor: isActive ? b.bg : 'transparent',
                                color: isActive ? b.text : '#6D6D72',
                                border: isActive ? `1px solid ${b.border}` : '1px solid transparent',
                            }}
                        >
                            {b.label}
                        </button>
                    )
                })}
            </div>

            <button
                onClick={onToggleDone}
                className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.98]"
                style={{
                    backgroundColor: showDone ? '#2C2C2E' : 'transparent',
                    color: showDone ? '#F5F5F7' : '#6D6D72',
                    border: showDone ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                }}
            >
                Done
            </button>
        </div>
    )
}
