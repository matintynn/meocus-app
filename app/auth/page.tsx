'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { updateProfile } from '@/lib/db/profile'

type Mode = 'signin' | 'signup' | 'forgot' | 'forgot-sent'

const SIGNUP_STEPS = ['Loading...', 'Creating account...', 'Done']

const EMAIL_PROVIDERS = [
    { label: 'Gmail', url: 'https://mail.google.com' },
    { label: 'Outlook', url: 'https://outlook.live.com' },
    { label: 'iCloud', url: 'https://www.icloud.com/mail' },
    { label: 'Yahoo', url: 'https://mail.yahoo.com' },
]

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>('signin')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [signUpStep, setSignUpStep] = useState(0)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showForgotLink, setShowForgotLink] = useState(false)

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [forgotError, setForgotError] = useState<string | null>(null)

    const router = useRouter()

    // Cycle through signup step messages
    useEffect(() => {
        if (!loading || mode !== 'signup') return
        if (signUpStep >= SIGNUP_STEPS.length - 1) return
        const timeout = setTimeout(() => setSignUpStep((s) => s + 1), 800)
        return () => clearTimeout(timeout)
    }, [loading, mode, signUpStep])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        setSignUpStep(0)

        const supabase = createClient()

        if (mode === 'signup') {
            const { error: authError } = await supabase.auth.signUp({ email, password })
            if (authError) {
                setError(authError.message)
                setLoading(false)
                return
            }
            if (name.trim()) {
                try { await updateProfile(name.trim()) } catch { /* profile trigger may not be ready yet */ }
            }
            localStorage.setItem('is_new_user', 'true')
            setTimeout(() => {
                setLoading(false)
                setShowConfirmModal(true)
            }, SIGNUP_STEPS.length * 800)
        } else {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
            if (authError) {
                setError(authError.message)
                setShowForgotLink(true)
                setLoading(false)
                return
            }
            router.push('/today')
            router.refresh()
        }
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault()
        setForgotError(null)
        setForgotLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: window.location.origin + '/auth/reset',
        })
        setForgotLoading(false)
        if (error) {
            setForgotError(error.message)
            return
        }
        setMode('forgot-sent')
    }

    function handleCloseModal() {
        setShowConfirmModal(false)
        setMode('signin')
        setName('')
        setEmail('')
        setPassword('')
        setError(null)
        setShowForgotLink(false)
    }

    function switchMode(next: Mode) {
        setMode(next)
        setError(null)
        setShowForgotLink(false)
        setForgotError(null)
    }

    function getButtonLabel() {
        if (!loading) return mode === 'signup' ? 'Sign up' : 'Sign in'
        if (mode === 'signup') return SIGNUP_STEPS[signUpStep]
        return '...'
    }

    // ─── Forgot password form ──────────────────────────
    if (mode === 'forgot') {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center px-4">
                <div className="w-full max-w-[360px]">
                    <div className="flex justify-center mb-4">
                        <Image src="/avatar.png" alt="Clawlist" width={56} height={56} className="rounded-2xl" />
                    </div>
                    <h1 className="text-[28px] font-bold text-text text-center mb-1">Reset password</h1>
                    <p className="text-sm text-text3 text-center mb-8">
                        Enter your email and we'll send you a reset link
                    </p>

                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-text3 outline-none transition-colors"
                        />
                        {forgotError && (
                            <p className="text-sm text-urgent px-1">{forgotError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={forgotLoading}
                            className="h-11 rounded-xl bg-white text-bg text-sm font-semibold hover:bg-white/90 transition-colors disabled:cursor-not-allowed"
                        >
                            {forgotLoading ? '...' : 'Send reset link'}
                        </button>
                    </form>

                    <p className="text-sm text-text3 text-center mt-6">
                        <button
                            type="button"
                            onClick={() => switchMode('signin')}
                            className="text-text underline underline-offset-2 hover:text-white transition-colors"
                        >
                            Back to sign in
                        </button>
                    </p>
                </div>
            </div>
        )
    }

    // ─── Forgot-sent confirmation ──────────────────────
    if (mode === 'forgot-sent') {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center px-4">
                <div className="w-full max-w-[360px] text-center">
                    <div className="flex justify-center mb-6">
                        <Image src="/avatar.png" alt="Clawlist" width={56} height={56} className="rounded-2xl" />
                    </div>
                    <h2 className="text-[22px] font-bold text-text mb-2">Check your email</h2>
                    <p className="text-sm text-text2 mb-6">
                        We sent a reset link to{' '}
                        <span className="text-text">{forgotEmail}</span>
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap mb-8">
                        {EMAIL_PROVIDERS.map((p) => (
                            <a
                                key={p.label}
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-9 px-4 rounded-xl bg-surface border border-border text-sm text-text2 hover:text-text hover:border-border2 transition-colors flex items-center"
                            >
                                {p.label}
                            </a>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="text-sm text-text3 hover:text-text2 transition-colors underline underline-offset-2"
                    >
                        Back to sign in
                    </button>
                </div>
            </div>
        )
    }

    // ─── Sign in / Sign up ─────────────────────────────
    const isSignUp = mode === 'signup'

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="w-full max-w-[360px]">
                <div className="flex justify-center mb-4">
                    <Image src="/avatar.png" alt="Clawlist" width={56} height={56} className="rounded-2xl" />
                </div>
                <h1 className="text-[28px] font-bold text-text text-center mb-1">
                    Clawlist
                </h1>
                <p className="text-sm text-text3 text-center mb-8">
                    {isSignUp ? 'Create your account' : 'Sign in to your account'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {isSignUp && (
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-text3 outline-none transition-colors"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-text3 outline-none transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-text3 outline-none transition-colors"
                    />

                    {error && (
                        <div className="flex items-center justify-between gap-2 px-1">
                            <p className="text-sm text-urgent">
                                {error === 'Invalid login credentials' ? 'Invalid password' : error}
                            </p>
                            {showForgotLink && !isSignUp && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotEmail(email)
                                        switchMode('forgot')
                                    }}
                                    className="text-sm text-text3 hover:text-text2 transition-colors underline underline-offset-2 whitespace-nowrap flex-shrink-0"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 rounded-xl bg-white text-bg text-sm font-semibold hover:bg-white/90 transition-colors disabled:cursor-not-allowed"
                    >
                        {getButtonLabel()}
                    </button>
                </form>

                <p className="text-sm text-text3 text-center mt-6">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
                        className="text-text underline underline-offset-2 hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>
            </div>

            {/* Signup confirmation modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-bg z-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-[400px] text-center">
                        <div className="flex justify-center mb-6">
                            <Image src="/avatar.png" alt="Clawlist" width={72} height={72} className="rounded-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-text mb-3">Account created!</h2>
                        <p className="text-base text-text2 leading-relaxed mb-1">
                            Go to your email to confirm your account.
                        </p>
                        <p className="text-sm text-text3 mb-8">
                            Happy productive &lt;3
                        </p>
                        <button
                            onClick={handleCloseModal}
                            className="w-full max-w-[280px] h-11 rounded-xl bg-white text-bg text-sm font-semibold hover:bg-white/90 transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
