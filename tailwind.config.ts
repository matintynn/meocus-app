import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: '#0F0F0F',
                surface: '#1C1C1E',
                surface2: '#2C2C2E',
                surface3: '#3A3A3C',

                text: '#F5F5F7',
                text2: '#AEAEB2',
                text3: '#6D6D72',

                work: '#3B82F6',
                'work-bg': '#1D3461',
                'work-text': '#93C5FD',

                learn: '#F59E0B',
                'learn-bg': '#3D2B0A',
                'learn-text': '#FCD34D',

                life: '#D946EF',
                'life-bg': '#2E1336',
                'life-text': '#E879F9',

                urgent: '#EF4444',
                'urgent-bg': '#3B1212',
                'urgent-text': '#FCA5A5',

                someday: '#71717A',
                'someday-bg': '#27272A',

                carried: '#D97706',
                'carried-bg': '#292008',

                border: 'rgba(255,255,255,0.10)',
                border2: 'rgba(255,255,255,0.18)',
            },
        },
    },
    plugins: [],
}
export default config
