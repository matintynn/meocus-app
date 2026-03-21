import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-manrope',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Focus',
    description: 'Personal productivity app',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={manrope.variable}>
            <body className={manrope.className}>
                <StoreProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </StoreProvider>
            </body>
        </html>
    )
}
