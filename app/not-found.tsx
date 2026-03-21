import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="h-screen bg-bg flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-[48px] font-semibold text-text mb-2">404</h1>
                <p className="text-[14px] text-text2 mb-6">Page not found</p>
                <Link
                    href="/today"
                    className="text-[13px] font-medium text-text bg-surface2 border border-border rounded-xl px-5 py-2.5 hover:bg-surface3 transition-all duration-150"
                >
                    Back to Today
                </Link>
            </div>
        </div>
    )
}
