'use client'

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from 'react'

interface ToastState {
    id: number
    message: string
    visible: boolean
}

interface ToastContextValue {
    showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastState[]>([])

    const showToast = useCallback((message: string) => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, message, visible: true }])
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
            )
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, 200)
        }, 2500)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto rounded-xl px-[18px] py-[10px] text-[13px] font-medium"
                        style={{
                            backgroundColor: '#F5F5F7',
                            color: '#0F0F0F',
                            animation: toast.visible
                                ? 'toastIn 0.2s ease forwards'
                                : 'toastOut 0.2s ease forwards',
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(8px); }
        }
      `}</style>
        </ToastContext.Provider>
    )
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}
