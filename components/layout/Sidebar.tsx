'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { createClient } from '@/lib/supabase'
import { fetchProfile } from '@/lib/db/profile'
import { daysRemaining, getSprintProgress } from '@/lib/utils/dates'
import { ListTodo, CalendarDays, BookOpen, ClipboardList, Settings, LogOut } from 'lucide-react'

const navItems = [
    {
        label: 'All tasks',
        href: '/tasks',
        icon: <ListTodo size={16} />,
    },
    {
        label: 'Sprint',
        href: '/sprint',
        icon: <CalendarDays size={16} />,
    },
    {
        label: 'Journal',
        href: '/journal',
        icon: <BookOpen size={16} />,
    },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const store = useStore()

    const [now, setNow] = useState(() => new Date())
    const [profileName, setProfileName] = useState('')

    useEffect(() => {
        fetchProfile().then((p) => { if (p?.name) setProfileName(p.name) }).catch(() => { })
    }, [])

    useEffect(() => {
        const tick = () => setNow(new Date())
        const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000
        const timeout = setTimeout(() => {
            tick()
            const interval = setInterval(tick, 60_000)
            return () => clearInterval(interval)
        }, msUntilNextMinute)
        return () => clearTimeout(timeout)
    }, [])

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '')
    const dateStr = `${dayNames[now.getDay()]} ${monthNames[now.getMonth()]} ${now.getDate()}`

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
                <div className="flex items-center gap-2.5 px-4 pt-6 pb-4">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src="/avatar.png" alt="Avatar" width={36} height={36} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[17px] text-white leading-tight">
                            Hi {profileName || 'there'}!
                        </span>
                        <span className="text-[12px] text-text1 mt-0.5">
                            {timeStr} · {dateStr}
                        </span>
                    </div>
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
                                    <span className="bg-surface3 text-text font-semibold text-[11px] px-1.5 py-px rounded-full">
                                        {store.openCount}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Tools section */}
                <div className="px-2 mt-4">
                    <div className="text-[10px] font-medium text-text3 uppercase tracking-[0.08em] ml-2 mb-1">
                        Tools
                    </div>
                    {(() => {
                        const isActive = pathname === '/checklists'
                        return (
                            <Link
                                href="/checklists"
                                onClick={onClose}
                                className={`flex items-center gap-2.5 h-[34px] px-2.5 rounded-[10px] text-[13px] transition-all duration-150 ${isActive ? 'bg-surface2 text-text font-medium' : 'text-text2 hover:bg-surface2 hover:text-text'}`}
                            >
                                <span className={isActive ? 'opacity-100' : 'opacity-60'}>
                                    <ClipboardList size={16} />
                                </span>
                                <span className="flex-1">Checklists</span>
                                {store.checklists.length > 0 && (
                                    <span className="bg-surface3 text-text font-semibold text-[11px] px-1.5 py-px rounded-full">
                                        {store.checklists.length}
                                    </span>
                                )}
                            </Link>
                        )
                    })()}
                    {(() => {
                        const isActive = pathname === '/settings'
                        return (
                            <Link
                                href="/settings"
                                onClick={onClose}
                                className={`flex items-center gap-2.5 h-[34px] px-2.5 rounded-[10px] text-[13px] transition-all duration-150 ${isActive ? 'bg-surface2 text-text font-medium' : 'text-text2 hover:bg-surface2 hover:text-text'}`}
                            >
                                <span className={isActive ? 'opacity-100' : 'opacity-60'}>
                                    <Settings size={16} />
                                </span>
                                <span className="flex-1">Settings</span>
                            </Link>
                        )
                    })()}
                </div>

                {/* Sprint mini card */}
                <div className="mt-auto px-3 pb-3">
                    {store.sprint && store.sprint.isActive && (
                        <Link href="/sprint" onClick={onClose}>
                            <div className="bg-surface2 border border-border rounded-xl p-3">
                                <div className="text-[10px] font-semibold text-green-500 uppercase tracking-[0.08em] mb-1 flex items-center gap-1.5">
                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_5px_2px_rgba(34,197,94,0.4)] flex-shrink-0" />
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
                    )}
                </div>

                {/* Sign out */}
                <div className="px-2 pb-5">
                    <button
                        onClick={async () => {
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            router.push('/auth')
                            router.refresh()
                        }}
                        className="flex items-center gap-2.5 h-[34px] w-full px-2.5 rounded-[10px] text-[13px] text-text3 hover:bg-surface2 hover:text-text transition-all duration-150"
                    >
                        <LogOut size={16} className="opacity-60" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
