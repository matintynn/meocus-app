'use client'

import { Bucket } from '@/lib/types'

interface GoalCardProps {
    bucket: Bucket
    goal: string
}

const bucketConfig: Record<Bucket, { color: string; label: string; textColor: string }> = {
    work: { color: '#3B82F6', label: 'WORK', textColor: '#93C5FD' },
    learn: { color: '#F59E0B', label: 'LEARN', textColor: '#FCD34D' },
    life: { color: '#D946EF', label: 'PERSONAL', textColor: '#E879F9' },
}

export default function GoalCard({ bucket, goal }: GoalCardProps) {
    const config = bucketConfig[bucket]

    return (
        <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
                <span
                    className="w-[7px] h-[7px] rounded-full"
                    style={{ backgroundColor: config.color }}
                />
                <span
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: config.textColor }}
                >
                    {config.label}
                </span>
            </div>
            {goal ? (
                <p className="text-[14px] text-text leading-relaxed">{goal}</p>
            ) : (
                <p className="text-[13px] text-text3 italic">Not set</p>
            )}
        </div>
    )
}
