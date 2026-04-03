import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/ui/Toast'
import AuthGuard from '@/components/auth/AuthGuard'
import './globals.css'

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-manrope',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Clawlist',
    description: 'Personal productivity app',
    icons: {
        icon: '/favicon.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={manrope.variable}>
            <body className={manrope.className}>
                <ToastProvider>
                    <AuthGuard>
                        <StoreProvider>
                            {children}
                        </StoreProvider>
                    </AuthGuard>
                </ToastProvider>
            </body>
        </html>
    )
}
