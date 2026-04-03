'use client'

import { ReactNode, useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ animation: 'fadeIn 0.15s ease' }}
        >
            <div
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
            />
            <div
                className="relative bg-surface border border-border2 rounded-2xl p-7 w-[90vw] max-w-[480px] max-h-[90vh] overflow-y-auto"
                style={{ animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
                {children}
            </div>
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}
