'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Checkin } from '@/lib/types'

interface EditCheckinModalProps {
    checkin: Checkin | null
    isOpen: boolean
    onClose: () => void
    onSave: (updated: Checkin) => void
    onDelete: (id: string) => void
}

export default function EditCheckinModal({ checkin, isOpen, onClose, onSave, onDelete }: EditCheckinModalProps) {
    const [proud, setProud] = useState('')
    const [tomorrow, setTomorrow] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (checkin) {
            setProud(checkin.proud)
            setTomorrow(checkin.tomorrow)
            setNotes(checkin.notes)
        }
    }, [checkin])

    function handleSave() {
        if (!checkin) return
        onSave({ ...checkin, proud, tomorrow, notes })
        onClose()
    }

    function handleDelete() {
        if (!checkin) return
        onDelete(checkin.id)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                Edit reflection
            </h2>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
                Update or delete this reflection.
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
                />
            </label>

            <div className="flex items-center justify-between">
                <button
                    onClick={handleDelete}
                    className="text-[13px] text-text3 hover:text-red-400 transition-colors duration-150"
                >
                    Delete
                </button>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save changes</Button>
                </div>
            </div>
        </Modal>
    )
}
