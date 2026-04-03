'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { fetchProfile, updateProfile } from '@/lib/db/profile'

export default function OnboardingModal() {
    const [show, setShow] = useState(false)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('is_new_user') !== 'true') return

        // Load existing profile name
        fetchProfile().then((profile) => {
            if (profile?.name) setName(profile.name)
            setShow(true)
        }).catch(() => {
            setShow(true)
        })
    }, [])

    async function handleClose() {
        if (name.trim()) {
            setSaving(true)
            try {
                await updateProfile(name.trim())
            } catch {
                // Silent — name was already saved at signup
            }
            setSaving(false)
        }
        localStorage.removeItem('is_new_user')
        setShow(false)
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-[400px]">
                <div className="flex justify-center mb-4">
                    <Image src="/avatar.png" alt="Clawlist" width={48} height={48} className="rounded-xl" />
                </div>
                <h2 className="text-lg font-bold text-text text-center mb-1">
                    Welcome to Clawlist{name ? `, ${name}` : ''}! 👋
                </h2>
                <p className="text-sm text-text3 text-center mb-5">
                    Your new productivity companion
                </p>

                <div className="mb-5">
                    <label className="text-[11px] font-medium text-text3 uppercase tracking-[0.08em] mb-1.5 block">
                        Your name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="What should we call you?"
                        className="w-full h-10 px-3 rounded-xl bg-surface2 border border-border text-sm text-text placeholder:text-text3 outline-none focus:border-border2 transition-colors"
                    />
                </div>

                <div className="mb-6">
                    <h3 className="text-[11px] font-medium text-text3 uppercase tracking-[0.08em] mb-2">
                        Here&apos;s what you can do
                    </h3>
                    <ul className="flex flex-col gap-1.5 text-[13px] text-text2">
                        <li className="flex items-start gap-2">
                            <span className="text-text3 mt-0.5">•</span>
                            <span><strong className="text-text">Today</strong> — pin tasks for daily focus</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-text3 mt-0.5">•</span>
                            <span><strong className="text-text">Sprints</strong> — set weekly goals across work, learn &amp; life</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-text3 mt-0.5">•</span>
                            <span><strong className="text-text">Journal</strong> — daily check-ins to reflect on progress</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-text3 mt-0.5">•</span>
                            <span><strong className="text-text">Checklists</strong> — repeatable workflows you can reset</span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={handleClose}
                    disabled={saving}
                    className="w-full h-10 rounded-xl bg-white text-bg text-sm font-semibold hover:bg-white/90 transition-colors disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Get Started'}
                </button>
            </div>
        </div>
    )
}
