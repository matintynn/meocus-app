'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface CheckinModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: { proud: string; tomorrow: string; notes: string }) => void
}

export default function CheckinModal({ isOpen, onClose, onSave }: CheckinModalProps) {
    const [proud, setProud] = useState('')
    const [tomorrow, setTomorrow] = useState('')
    const [notes, setNotes] = useState('')

    function handleSave() {
        onSave({ proud, tomorrow, notes })
        setProud('')
        setTomorrow('')
        setNotes('')
    }

    function handleClose() {
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                Evening check-in
            </h2>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
                Take a moment to reflect on your day.
            </p>

            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    What are you proud of today?
                </span>
                <textarea
                    value={proud}
                    onChange={(e) => setProud(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none resize-none"
                    rows={2}
                    placeholder="I finished..."
                />
            </label>

            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    What will you focus on tomorrow?
                </span>
                <textarea
                    value={tomorrow}
                    onChange={(e) => setTomorrow(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Tomorrow I'll..."
                />
            </label>

            <label className="block mb-5">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Notes
                </span>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Anything else..."
                />
            </label>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save check-in</Button>
            </div>
        </Modal>
    )
}
