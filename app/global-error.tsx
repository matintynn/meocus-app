'use client'

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-[#0F0F0F]">
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-[48px] font-semibold text-[#F5F5F7] mb-2">Oops</h1>
                        <p className="text-[14px] text-[#AEAEB2] mb-6">Something went wrong</p>
                        <button
                            onClick={reset}
                            className="text-[13px] font-medium text-[#F5F5F7] bg-[#2C2C2E] border border-[rgba(255,255,255,0.10)] rounded-xl px-5 py-2.5 hover:bg-[#3A3A3C] transition-all duration-150"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
