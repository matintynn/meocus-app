'use client'

interface TagProps {
    variant: 'work' | 'learn' | 'life' | 'urgent' | 'someday' | 'carried' | 'sprint'
    label: string
    size?: 'sm' | 'default'
}

const colorMap: Record<TagProps['variant'], { bg: string; text: string }> = {
    work: { bg: '#1D3461', text: '#93C5FD' },
    learn: { bg: '#3D2B0A', text: '#FCD34D' },
    life: { bg: '#2E1336', text: '#E879F9' },
    urgent: { bg: '#3B1212', text: '#FCA5A5' },
    someday: { bg: '#27272A', text: '#A1A1AA' },
    carried: { bg: '#292008', text: '#FCD34D' },
    sprint: { bg: '#1A1A2E', text: '#818CF8' },
}

export default function Tag({ variant, label, size = 'default' }: TagProps) {
    const colors = colorMap[variant]
    const isSmall = size === 'sm'

    return (
        <span
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: isSmall ? '10px' : '11px',
                fontWeight: 500,
                padding: isSmall ? '2px 6px' : '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                display: 'inline-block',
            }}
        >
            {label}
        </span>
    )
}
