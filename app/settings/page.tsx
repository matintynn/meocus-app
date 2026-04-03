'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase'
import { fetchProfile, updateProfile } from '@/lib/db/profile'
import { Eye, EyeOff } from 'lucide-react'

const SETTINGS_LIST = [
    {
        key: 'confettiOnDone' as const,
        title: 'Confetti on task done',
        description: 'Play a confetti animation when you complete a task',
    },
    {
        key: 'showCarriedOverBanner' as const,
        title: 'Show carried-over banner',
        description: 'Display a reminder for tasks carried over from yesterday',
    },
]

function SettingsContent() {
    const toggle = useSidebarToggle()
    const { settings, updateSettings } = useStore()
    const { showToast } = useToast()

    // Profile state
    const [profileName, setProfileName] = useState('')
    const [profileEmail, setProfileEmail] = useState('')
    const [savingName, setSavingName] = useState(false)

    // Password state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) setProfileEmail(user.email)
        })
        fetchProfile().then((p) => {
            if (p?.name) setProfileName(p.name)
        }).catch(() => { })
    }, [])

    async function handleSaveName() {
        if (!profileName.trim()) return
        setSavingName(true)
        try {
            await updateProfile(profileName.trim())
            showToast('Name updated')
        } catch (err: any) {
            showToast(`Failed to update name: ${err.message}`)
        }
        setSavingName(false)
    }

    async function handleChangePassword() {
        if (!newPassword || !confirmPassword) {
            showToast('Please fill in both password fields')
            return
        }
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters')
            return
        }
        setSavingPassword(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            showToast('Password updated')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            showToast(`Failed to update password: ${err.message}`)
        }
        setSavingPassword(false)
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0">
                <Topbar
                    title={<h1 className="font-semibold text-[22px] leading-tight text-text">Settings</h1>}
                    onMenuClick={toggle}
                />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-[480px] mx-auto">
                    {/* My Profile */}
                    <div className="mb-8">
                        <h2 className="text-[11px] font-medium text-text3 uppercase tracking-[0.08em] mb-3">
                            My Profile
                        </h2>
                        <div className="flex flex-col gap-3 px-5 py-5 rounded-xl border border-border">
                            {/* Name */}
                            <div>
                                <label className="text-[11px] font-medium text-text3 uppercase tracking-[0.06em] mb-1 block">Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Need Name"
                                        className="flex-1 h-9 px-3 rounded-lg bg-surface2 border border-border text-[13px] text-text placeholder:text-text3 outline-none transition-colors"
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={savingName}
                                        className="h-9 px-4 rounded-lg bg-surface2 border border-border text-[12px] font-medium text-text hover:border-border2 transition-colors disabled:opacity-50"
                                    >
                                        {savingName ? '...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                            {/* Email */}
                            <div>
                                <label className="text-[11px] font-medium text-text3 uppercase tracking-[0.06em] mb-1 block">Email</label>
                                <div className="h-9 px-3 rounded-lg bg-surface2 border border-border flex items-center text-[13px] text-text3">
                                    {profileEmail || '—'}
                                </div>
                            </div>
                            {/* Change Password */}
                            <div className="pt-2 border-t border-border">
                                <label className="text-[11px] font-medium text-text3 uppercase tracking-[0.06em] mb-1.5 block">Change Password</label>
                                <div className="flex flex-col gap-2">
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New password"
                                            minLength={6}
                                            className="w-full h-9 pl-3 pr-9 rounded-lg bg-surface2 border border-border text-[13px] text-text placeholder:text-text3 outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((v) => !v)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text3 hover:text-text2 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            minLength={6}
                                            className="w-full h-9 pl-3 pr-9 rounded-lg bg-surface2 border border-border text-[13px] text-text placeholder:text-text3 outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text3 hover:text-text2 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={savingPassword}
                                        className="self-end h-9 px-4 rounded-lg bg-surface2 border border-border text-[12px] font-medium text-text hover:border-border2 transition-colors disabled:opacity-50"
                                    >
                                        {savingPassword ? '...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="mb-8">
                        <h2 className="text-[11px] font-medium text-text3 uppercase tracking-[0.08em] mb-3">
                            Preferences
                        </h2>
                        <div className="flex flex-col gap-2">
                            {SETTINGS_LIST.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => updateSettings({ [s.key]: !settings[s.key] })}
                                    className="flex items-center justify-between gap-4 w-full px-5 py-5 rounded-xl border border-border hover:border-border2 transition-all text-left"
                                >
                                    <div>
                                        <div className="text-[13px] font-medium text-text">{s.title}</div>
                                        <div className="text-[11px] text-text3 mt-0.5">{s.description}</div>
                                    </div>
                                    <div className={`w-9 h-5 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ${settings[s.key] ? 'bg-text2' : 'bg-surface3'}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 mx-0.5 ${settings[s.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h2 className="text-[11px] font-medium text-text3 uppercase tracking-[0.08em] mb-3">
                            About
                        </h2>
                        <div className="px-5 py-5 rounded-xl border border-border">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[13px] font-medium text-text">Clawlist</span>
                                <span className="text-[11px] font-semibold text-text3 bg-surface2 px-2 py-0.5 rounded-full">v1.1</span>
                            </div>
                            <p className="text-[12px] text-text2 leading-relaxed mb-1">
                                A sleek little dashboard for cats who get things done — tasks, sprints, and journals all in one spot. 🐱
                            </p>
                            <p className="text-[12px] text-text3 leading-relaxed">
                                No fluff, no hairballs, just focus.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <AppShell>
            <SettingsContent />
        </AppShell>
    )
}
