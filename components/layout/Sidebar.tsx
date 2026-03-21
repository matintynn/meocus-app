'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { daysRemaining, getSprintProgress } from '@/lib/utils/dates'

const navItems = [
    {
        label: 'Today',
        href: '/today',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4.5V8L10 10" />
            </svg>
        ),
    },
    {
        label: 'All tasks',
        href: '/tasks',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 4h10M3 8h10M3 12h7" />
            </svg>
        ),
    },
    {
        label: 'Sprint',
        href: '/sprint',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h12v10H2zM5.5 3V1.5M10.5 3V1.5M2 6.5h12" />
            </svg>
        ),
    },
    {
        label: 'Journal',
        href: '/journal',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2h10v12H3zM5.5 5h5M5.5 8h5M5.5 11h3" />
            </svg>
        ),
    },
    {
        label: 'Activity',
        href: '/activity',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8h3l2-5 2 10 2-5h3" />
            </svg>
        ),
    },
]

const buckets = [
    { label: 'Work', color: '#3B82F6', key: 'workCount' as const },
    { label: 'Learn', color: '#F59E0B', key: 'learnCount' as const },
    { label: 'Personal', color: '#D946EF', key: 'lifeCount' as const },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const store = useStore()

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-[220px] bg-surface border-r border-border z-50
          flex flex-col
          transition-transform duration-150 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-4 py-4">
                    <div className="w-7 h-7 rounded-lg bg-text flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                                d="M7 1L8.5 5L13 5.5L9.5 8.5L10.5 13L7 10.5L3.5 13L4.5 8.5L1 5.5L5.5 5L7 1Z"
                                fill="#0F0F0F"
                            />
                        </svg>
                    </div>
                    <span className="font-semibold text-[17px] text-text">
                        Focus
                    </span>
                </div>

                {/* Nav items */}
                <nav className="flex flex-col gap-0.5 px-2 mt-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                  flex items-center gap-2.5 h-[34px] px-2.5 rounded-[10px] text-[13px] transition-all duration-150
                  ${isActive ? 'bg-surface2 text-text font-medium' : 'text-text2 hover:bg-surface2 hover:text-text'}
                `}
                            >
                                <span className={isActive ? 'opacity-100' : 'opacity-60'}>
                                    {item.icon}
                                </span>
                                <span className="flex-1">{item.label}</span>
                                {item.label === 'All tasks' && (
                                    <span className="bg-surface3 text-text3 text-[11px] px-1.5 py-px rounded-full">
                                        {store.openCount}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Buckets section */}
                <div className="px-2 mt-4">
                    <div className="text-[10px] font-medium text-text3 uppercase tracking-[0.08em] ml-2 mb-1">
                        Buckets
                    </div>
                    {buckets.map((bucket) => (
                        <div
                            key={bucket.label}
                            className="flex items-center gap-2.5 h-[34px] px-2.5 rounded-[10px] text-[13px] text-text2"
                        >
                            <span
                                className="w-[7px] h-[7px] rounded-full mr-0.5"
                                style={{ backgroundColor: bucket.color }}
                            />
                            <span className="flex-1">{bucket.label}</span>
                            <span className="bg-surface3 text-text3 text-[11px] px-1.5 py-px rounded-full">
                                {store[bucket.key]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Sprint mini card */}
                <div className="mt-auto px-3 pb-4">
                    {store.sprint && store.sprint.isActive ? (
                        <Link href="/sprint" onClick={onClose}>
                            <div className="bg-surface2 border border-border rounded-xl p-3">
                                <div className="text-[10px] font-medium text-text3 uppercase tracking-[0.08em] mb-1">
                                    Active Sprint
                                </div>
                                <div className="text-xs text-text line-clamp-2 mb-2">
                                    {store.sprint.title}
                                </div>
                                <div className="w-full h-[3px] bg-surface3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-text2 rounded-full transition-all duration-150"
                                        style={{
                                            width: `${getSprintProgress(store.sprint.startDate, store.sprint.endDate)}%`,
                                        }}
                                    />
                                </div>
                                <div className="text-[10px] text-text3 mt-1">
                                    {daysRemaining(store.sprint.endDate)} days left
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/sprint" onClick={onClose}>
                            <div className="bg-surface2 border border-border rounded-xl p-3">
                                <div className="text-xs text-text3">No sprint — set one →</div>
                            </div>
                        </Link>
                    )}
                </div>
            </aside>
        </>
    )
}
