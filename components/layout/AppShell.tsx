'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import Sidebar from './Sidebar'
import { useStore } from '@/lib/store'
import ConfettiOverlay from '@/components/ui/ConfettiOverlay'
import OnboardingModal from '@/components/OnboardingModal'

const SidebarContext = createContext<() => void>(() => { })
export const useSidebarToggle = () => useContext(SidebarContext)

interface AppShellProps {
    children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { confettiKey, confettiBucket, isLoading } = useStore()

    if (isLoading) {
        return (
            <div className="h-screen bg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-text/20 border-t-text/70" />
            </div>
        )
    }

    return (
        <SidebarContext.Provider value={() => setSidebarOpen(true)}>
            <div className="h-screen bg-bg flex overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="md:ml-[220px] flex-1 h-screen flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden px-4 py-4 md:px-7 md:py-6">
                        {children}
                    </div>
                </main>
            </div>
            <ConfettiOverlay confettiKey={confettiKey} confettiBucket={confettiBucket} />
            <OnboardingModal />
        </SidebarContext.Provider>
    )
}
