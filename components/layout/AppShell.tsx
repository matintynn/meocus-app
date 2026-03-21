'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import Sidebar from './Sidebar'

const SidebarContext = createContext<() => void>(() => { })
export const useSidebarToggle = () => useContext(SidebarContext)

interface AppShellProps {
    children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

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
        </SidebarContext.Provider>
    )
}
