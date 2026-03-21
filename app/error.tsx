'use client'

export default function Error({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="h-screen bg-bg flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-[48px] font-semibold text-text mb-2">Oops</h1>
                <p className="text-[14px] text-text2 mb-6">Something went wrong</p>
                <button
                    onClick={reset}
                    className="text-[13px] font-medium text-text bg-surface2 border border-border rounded-xl px-5 py-2.5 hover:bg-surface3 transition-all duration-150"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
