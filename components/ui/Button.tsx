'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
}

export default function Button({
    variant = 'primary',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const base =
        'inline-flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-medium px-4 py-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none capitalize'

    const variants = {
        primary: 'bg-text text-bg hover:opacity-85',
        secondary:
            'bg-transparent border border-border text-text2 hover:bg-surface2 hover:text-text hover:border-border2',
    }

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}
