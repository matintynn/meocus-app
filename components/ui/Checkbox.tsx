'use client'

import { Check } from 'lucide-react'

interface CheckboxProps {
    checked: boolean
    onChange: () => void
}

export default function Checkbox({ checked, onChange }: CheckboxProps) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={(e) => { e.stopPropagation(); onChange() }}
            className="relative flex-shrink-0 w-4 h-4 rounded transition-all duration-150 focus:outline-none cursor-pointer"
            style={{
                border: checked ? '1.5px solid #F5F5F7' : '1.5px solid rgba(255,255,255,0.18)',
                backgroundColor: checked ? '#F5F5F7' : 'transparent',
            }}
        >
            {checked && (
                <Check
                    className="absolute inset-0 m-auto"
                    size={10}
                    stroke="#0F0F0F"
                    strokeWidth={2}
                    style={{ animation: 'checkScale 0.15s ease' }}
                />
            )}
            <style jsx>{`
        @keyframes checkScale {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
        </button>
    )
}
