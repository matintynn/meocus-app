'use client'

import { ReactNode } from 'react'
import { SortMode } from '@/lib/utils/sort'

interface TopbarProps {
    title: ReactNode
    showSort?: boolean
    sortMode?: SortMode
    onSortChange?: (mode: SortMode) => void
    onMenuClick: () => void
    extra?: ReactNode
}

export default function Topbar({
    title,
    showSort = false,
    sortMode,
    onSortChange,
    onMenuClick,
    extra,
}: TopbarProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-text2 hover:bg-surface2 transition-all duration-150"
                    aria-label="Open menu"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 5h12M3 9h12M3 13h12" />
                    </svg>
                </button>
                <div>{title}</div>
            </div>
            <div className="flex items-center gap-2">
                {extra}
                {showSort && onSortChange && (
                    <select
                        value={sortMode}
                        onChange={(e) => onSortChange(e.target.value as SortMode)}
                        className="bg-surface2 border border-border text-text2 text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-border2 transition-all duration-150"
                    >
                        <option value="date-added">Date added</option>
                        <option value="deadline">Deadline</option>
                        <option value="status">Status</option>
                        <option value="bucket">Bucket</option>
                    </select>
                )}
            </div>
        </div>
    )
}
