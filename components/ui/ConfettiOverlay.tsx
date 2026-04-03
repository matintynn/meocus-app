'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import Lottie from 'lottie-react'

interface ConfettiOverlayProps {
    confettiKey: number
    confettiBucket: string | null
}

export default function ConfettiOverlay({ confettiKey, confettiBucket }: ConfettiOverlayProps) {
    const [visible, setVisible] = useState(false)
    const [localKey, setLocalKey] = useState(0)
    const [animationData, setAnimationData] = useState<object | null>(null)
    const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
    const fetched = useRef(false)
    const mountedKeyRef = useRef(confettiKey)

    useEffect(() => {
        if (fetched.current) return
        fetched.current = true
        fetch('/lotties/confetti.json')
            .then((r) => r.json())
            .then(setAnimationData)
            .catch(() => { })
    }, [])

    useEffect(() => {
        if (confettiKey === 0) return
        if (confettiKey === mountedKeyRef.current) return

        // Try to find the lane element and get its bounding rect
        let laneRect: { left: number; top: number; width: number; height: number } | null = null
        if (confettiBucket) {
            const el = document.getElementById(`lane-${confettiBucket}`)
            if (el) {
                const r = el.getBoundingClientRect()
                laneRect = { left: r.left, top: r.top, width: r.width, height: r.height }
            }
        }

        setRect(laneRect)
        setLocalKey((k) => k + 1)
        setVisible(true)
        const t = setTimeout(() => setVisible(false), 3600)
        return () => clearTimeout(t)
    }, [confettiKey, confettiBucket])

    if (!visible || !animationData || typeof document === 'undefined') return null

    const style = rect
        ? { position: 'fixed' as const, left: rect.left, top: rect.top, width: rect.width, height: rect.height }
        : { position: 'fixed' as const, inset: 0 }

    return createPortal(
        <div className="z-[200] pointer-events-none" style={style}>
            <Lottie
                key={localKey}
                animationData={animationData}
                loop={false}
                autoplay
                {...({ speed: 0.6 } as any)}
                style={{ width: '100%', height: '100%' }}
                rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
            />
        </div>,
        document.body
    )
}
