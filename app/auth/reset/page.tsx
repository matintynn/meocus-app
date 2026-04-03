'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        setLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setDone(true)
        setTimeout(() => {
            router.push('/today')
            router.refresh()
        }, 2000)
    }

    if (done) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center px-4">
                <div className="w-full max-w-[360px] text-center">
                    <div className="flex justify-center mb-6">
                        <Image src="/avatar.png" alt="Clawlist" width={56} height={56} className="rounded-2xl" />
                    </div>
                    <h2 className="text-[22px] font-bold text-text mb-2">Password updated!</h2>
                    <p className="text-sm text-text3">Taking you to the app...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="w-full max-w-[360px]">
                <div className="flex justify-center mb-4">
                    <Image src="/avatar.png" alt="Clawlist" width={56} height={56} className="rounded-2xl" />
                </div>
                <h1 className="text-[28px] font-bold text-text text-center mb-1">New password</h1>
                <p className="text-sm text-text3 text-center mb-8">Choose a new password for your account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type={showNew ? 'text' : 'password'}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-text3 outline-none transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-text2 transition-colors"
                        >
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-text3 outline-none transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-text2 transition-colors"
                        >
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-urgent px-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 rounded-xl bg-white text-bg text-sm font-semibold hover:bg-white/90 transition-colors disabled:cursor-not-allowed"
                    >
                        {loading ? '...' : 'Update password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
