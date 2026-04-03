'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { daysRemaining, getSprintProgress } from '@/lib/utils/dates'
import { ChevronRight } from 'lucide-react'

export default function SprintBanner() {
    const { sprint } = useStore()

    if (!sprint || !sprint.isActive) {
        return (
            <Link href="/sprint">
                <div className="bg-surface border border-border rounded-xl px-4 py-3 mb-6 text-[13px] text-text3 hover:border-border2 transition-all duration-150 flex items-center gap-1">
                    No sprint — set one <ChevronRight size={13} />
                </div>
            </Link>
        )
    }

    const progress = getSprintProgress(sprint.startDate, sprint.endDate)
    const days = daysRemaining(sprint.endDate)
    const circumference = 2 * Math.PI * 16
    const strokeDash = (progress / 100) * circumference

    return (
        <Link href="/sprint">
            <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 mb-6 hover:border-border2 transition-all duration-150">
                <div>
                    <div className="text-[10px] font-medium text-text3 uppercase tracking-[0.08em] mb-0.5">
                        Active Sprint
                    </div>
                    <div className="text-base text-text font-medium">{sprint.title}</div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Progress ring */}
                    <div className="relative w-10 h-10">
                        <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="#3A3A3C" strokeWidth="3" />
                            <circle
                                cx="20" cy="20" r="16"
                                fill="none"
                                stroke="#F5F5F7"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                className="transition-all duration-150"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-text2">
                            {progress}%
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold text-lg text-text">
                            {days}
                        </div>
                        <div className="text-[10px] text-text3">days left</div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
