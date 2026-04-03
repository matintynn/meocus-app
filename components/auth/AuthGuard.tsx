'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Skip auth check on the /auth page itself
        if (pathname === '/auth') {
            setReady(true)
            return
        }

        const supabase = createClient()
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace('/auth')
            } else {
                setReady(true)
            }
        })
    }, [pathname, router])

    if (pathname === '/auth') return <>{children}</>

    if (!ready) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-text3 border-t-text rounded-full animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
