'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import type { ChecklistItem } from '@/lib/types'
import { X } from 'lucide-react'

function generateId() {
    return crypto.randomUUID()
}

interface AddChecklistModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        title: string
        description: string
        category: string
        isTemplate: boolean
        items: ChecklistItem[]
    }) => void
    initial?: {
        title: string
        description: string
        category: string
        isTemplate: boolean
        items?: ChecklistItem[]
    }
    existingCategories: string[]
    mode?: 'create' | 'edit'
}

export default function AddChecklistModal({
    isOpen,
    onClose,
    onSave,
    initial,
    existingCategories,
    mode = 'create',
}: AddChecklistModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [isTemplate, setIsTemplate] = useState(false)
    const [items, setItems] = useState<ChecklistItem[]>([])
    const [itemInput, setItemInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const categoryRef = useRef<HTMLInputElement>(null)
    const itemInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setTitle(initial?.title ?? '')
            setDescription(initial?.description ?? '')
            setCategory(initial?.category ?? '')
            setIsTemplate(initial?.isTemplate ?? false)
            setItems(initial?.items ?? [])
            setItemInput('')
        }
    }, [isOpen, initial])

    const suggestions = existingCategories.filter(
        (c) => c.toLowerCase().includes(category.toLowerCase()) && c !== category
    )

    function addItem() {
        const trimmed = itemInput.trim()
        if (!trimmed) return
        setItems((prev) => [...prev, { id: generateId(), label: trimmed, isDone: false }])
        setItemInput('')
        itemInputRef.current?.focus()
    }

    function removeItem(id: string) {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }

    function handleSave() {
        const trimmed = title.trim()
        if (!trimmed) return
        // flush any pending item input
        const finalItems = itemInput.trim()
            ? [...items, { id: generateId(), label: itemInput.trim(), isDone: false }]
            : items
        onSave({
            title: trimmed,
            description: description.trim(),
            category: category.trim(),
            isTemplate,
            items: finalItems,
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="font-semibold text-[22px] leading-tight text-text mb-1">
                {mode === 'edit' ? 'Edit checklist' : 'New checklist'}
            </h2>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
                {mode === 'edit' ? 'Update the details for this checklist.' : 'Create a reusable checklist for any workflow.'}
            </p>

            {/* Title */}
            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Name
                </span>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') itemInputRef.current?.focus() }}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                    placeholder="e.g. Pre-launch review"
                    autoFocus
                />
            </label>

            {/* Description */}
            <label className="block mb-4">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Description <span className="normal-case font-normal opacity-60">— optional</span>
                </span>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                    placeholder="What is this checklist for?"
                />
            </label>

            {/* Category */}
            <div className="mb-5">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Tag / Category <span className="normal-case font-normal opacity-60">— optional</span>
                </span>
                <div className="relative">
                    <input
                        ref={categoryRef}
                        type="text"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setShowSuggestions(true) }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text placeholder:text-text3 focus:border-border2 focus:outline-none"
                        placeholder="e.g. Design, Research, Handoff…"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-surface border border-border2 rounded-xl overflow-hidden z-10 shadow-lg">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onMouseDown={() => { setCategory(s); setShowSuggestions(false) }}
                                    className="w-full text-left px-3 py-2 text-[13px] text-text hover:bg-surface2 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {existingCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {existingCategories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${category === c ? 'border-text2 text-text bg-surface2' : 'border-border text-text3 hover:border-border2 hover:text-text2'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="mb-5">
                <span className="text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5">
                    Items <span className="normal-case font-normal opacity-60">— optional</span>
                </span>

                {/* Existing items */}
                {items.length > 0 && (
                    <ul className="mb-2 flex flex-col gap-0.5">
                        {items.map((item) => (
                            <li key={item.id} className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2/60 transition-colors">
                                <div className="w-3.5 h-3.5 rounded border border-border2 flex-shrink-0" />
                                <span className="flex-1 text-[13px] text-text leading-snug">{item.label}</span>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-text3 hover:text-text transition-all flex-shrink-0"
                                    tabIndex={-1}
                                >
                                    <X size={10} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Add item input */}
                <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 focus-within:border-border2 transition-colors">
                    <div className="w-3.5 h-3.5 rounded border border-dashed border-border2 flex-shrink-0" />
                    <input
                        ref={itemInputRef}
                        type="text"
                        value={itemInput}
                        onChange={(e) => setItemInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addItem() }
                            if (e.key === 'Escape') setItemInput('')
                        }}
                        placeholder="Add an item… press Enter to confirm"
                        className="flex-1 bg-transparent text-[13px] text-text placeholder:text-text3 focus:outline-none"
                    />
                    {itemInput.trim() && (
                        <button
                            onMouseDown={(e) => { e.preventDefault(); addItem() }}
                            className="text-[11px] font-medium text-text2 hover:text-text px-1.5 py-0.5 rounded transition-colors flex-shrink-0"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>

            {/* Save as template toggle */}
            <button
                onClick={() => setIsTemplate((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all mb-6 ${isTemplate ? 'border-text2/40 bg-surface2' : 'border-border hover:border-border2'}`}
            >
                <div className="text-left">
                    <div className="text-[13px] font-medium text-text">Save as template</div>
                    <div className="text-[11px] text-text3 mt-0.5">Appears in the Templates section for quick reuse</div>
                </div>
                <div className={`w-9 h-5 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ml-4 ${isTemplate ? 'bg-text2' : 'bg-surface3'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 mx-0.5 ${isTemplate ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
            </button>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-border text-[13px] font-medium text-text2 hover:border-border2 hover:text-text transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!title.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-text text-bg text-[13px] font-medium hover:opacity-85 transition-all disabled:opacity-40"
                >
                    {mode === 'edit' ? 'Save changes' : 'Create'}
                </button>
            </div>
        </Modal>
    )
}
