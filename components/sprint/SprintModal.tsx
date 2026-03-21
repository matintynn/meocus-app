'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Sprint } from '@/lib/types'
import { toDateString } from '@/lib/utils/dates'

interface SprintModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (sprint: Omit<Sprint, 'id'>) => void
    existing?: Sprint | null
}

export default function SprintModal({ isOpen, onClose, onSave, existing }: SprintModalProps) {
    const [title, setTitle] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [workGoal, setWorkGoal] = useState('')
    const [learnGoal, setLearnGoal] = useState('')
    const [lifeGoal, setLifeGoal] = useState('')

    useEffect(() => {
        if (existing) {
            setTitle(existing.title)
            setStartDate(existing.startDate)
            setEndDate(existing.endDate)
            setWorkGoal(existing.workGoal)
            setLearnGoal(existing.learnGoal)
            setLifeGoal(existing.lifeGoal)
        } else {
            const today = toDateString(new Date())
            const twoWeeks = new Date()
            twoWeeks.setDate(twoWeeks.getDate() + 14)
            setTitle('')
            setStartDate(today)
            setEndDate(toDateString(twoWeeks))
            setWorkGoal('')
            setLearnGoal('')
            setLifeGoal('')
        }
    }, [existing, isOpen])

    function handleSave() {
        if (!title.trim()) return
        onSave({
            title: title.trim(),
            startDate,
            endDate,
            workGoal: workGoal.trim(),
            learnGoal: learnGoal.trim(),
            lifeGoal: lifeGoal.trim(),
            notes: existing?.notes ?? '',
            isActive: true,
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                {existing ? 'Edit sprint' : 'Start a new sprint'}
            </h2>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
                A sprint is 2 weeks of focused progress across work, learning, and life.
            </p>

            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Sprint title
                </span>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ship v2 + learn finance"
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                />
            </label>

            <div className="flex gap-3 mb-4">
                <label className="block flex-1">
                    <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                        Start date
                    </span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text focus:border-border2 focus:outline-none"
                        style={{ colorScheme: 'dark' }}
                    />
                </label>
                <label className="block flex-1">
                    <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                        End date
                    </span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text focus:border-border2 focus:outline-none"
                        style={{ colorScheme: 'dark' }}
                    />
                </label>
            </div>

            <label className="block mb-3">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Work goal
                </span>
                <input
                    type="text"
                    value={workGoal}
                    onChange={(e) => setWorkGoal(e.target.value)}
                    placeholder="What will you ship?"
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                />
            </label>

            <label className="block mb-3">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Learn goal
                </span>
                <input
                    type="text"
                    value={learnGoal}
                    onChange={(e) => setLearnGoal(e.target.value)}
                    placeholder="What will you learn?"
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                />
            </label>

            <label className="block mb-5">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Personal goal
                </span>
                <input
                    type="text"
                    value={lifeGoal}
                    onChange={(e) => setLifeGoal(e.target.value)}
                    placeholder="What habit will you build?"
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                />
            </label>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={!title.trim()}>
                    {existing ? 'Save changes' : 'Start sprint'}
                </Button>
            </div>
        </Modal>
    )
}
