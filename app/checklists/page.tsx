'use client'

import { useState, useRef, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useSidebarToggle } from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import type { Checklist, ChecklistItem } from '@/lib/types'
import AddChecklistModal from '@/components/ui/AddChecklistModal'
import { ChevronDown, ChevronRight, Pencil, X, Check, Plus } from 'lucide-react'

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const CATEGORY_COLORS: Record<string, string> = {
    Research: 'bg-blue-500/10 text-blue-400',
    Design: 'bg-purple-500/10 text-purple-400',
    Handoff: 'bg-amber-500/10 text-amber-400',
    QA: 'bg-green-500/10 text-green-400',
    System: 'bg-rose-500/10 text-rose-400',
}

function TemplatesSection({
    templates,
    onUse,
    onEdit,
    onDelete,
}: {
    templates: Checklist[]
    onUse: (tpl: Checklist) => void
    onEdit: (tpl: Checklist) => void
    onDelete: (id: string) => void
}) {
    const [activeCategory, setActiveCategory] = useState('All')
    const [open, setOpen] = useState(true)

    const categories = useMemo(
        () => ['All', ...Array.from(new Set(templates.map((t) => t.category).filter(Boolean)))],
        [templates]
    )

    const filtered = useMemo(
        () => activeCategory === 'All' ? templates : templates.filter((t) => t.category === activeCategory),
        [activeCategory, templates]
    )

    return (
        <div className="flex flex-col gap-3 flex-shrink-0">
            {/* Section header + category tabs + collapse toggle */}
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={() => setOpen((o) => !o)}
                    className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 flex-shrink-0 ${open ? 'border-border text-text2 hover:border-border2 hover:text-text' : 'border-border text-text3 hover:border-border2 hover:text-text2'}`}
                >
                    Templates
                    <ChevronDown
                        size={10}
                        strokeWidth={1.5}
                        className={`transition-transform duration-150 ${open ? '' : '-rotate-90'}`}
                    />
                </button>
                {open && (
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all duration-150 ${activeCategory === cat ? 'bg-surface2 text-text' : 'text-text3 hover:text-text2 hover:bg-surface2/50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Horizontal scroll row */}
            {open && (
                <div className="overflow-x-auto pb-2 scrollbar-none">
                    {filtered.length === 0 ? (
                        <p className="text-[12px] text-text3 italic py-1">No templates in this category.</p>
                    ) : (
                        <div className="flex gap-2.5 w-max">
                            {filtered.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    className="flex flex-col justify-between w-[280px] flex-shrink-0 bg-surface2/50 hover:bg-surface2 border border-border rounded-xl px-3 py-2.5 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-1">
                                        <span className="text-[13px] font-medium text-text leading-snug">{tpl.title}</span>
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            {tpl.category && (
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[tpl.category] ?? 'bg-surface3 text-text3'}`}>
                                                    {tpl.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {tpl.description && (
                                        <p className="text-[11px] text-text3 leading-relaxed flex-1">{tpl.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-text3">{tpl.items.length} items</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(tpl)}
                                                className="text-text3 hover:text-text transition-colors"
                                                title="Edit template"
                                            >
                                                <Pencil size={12} strokeWidth={1.5} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(tpl.id)}
                                                className="text-text3 hover:text-text transition-colors"
                                                title="Delete template"
                                            >
                                                <X size={11} strokeWidth={1.5} />
                                            </button>
                                            <button
                                                onClick={() => onUse(tpl)}
                                                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-text2 hover:text-text underline-offset-2 hover:underline transition-colors"
                                            >
                                                Use <ChevronRight size={11} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function ChecklistCard({
    checklist,
    onUpdate,
    onDelete,
    onToggleItem,
    onReset,
    onComplete,
}: {
    checklist: Checklist
    onUpdate: (c: Checklist) => void
    onDelete: (id: string) => void
    onToggleItem: (checklistId: string, itemId: string) => void
    onReset: (id: string) => void
    onComplete?: () => void
}) {
    const [collapsed, setCollapsed] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleVal, setTitleVal] = useState(checklist.title)
    const [newItemVal, setNewItemVal] = useState('')
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editingItemVal, setEditingItemVal] = useState('')
    const newItemRef = useRef<HTMLInputElement>(null)

    const doneCount = checklist.items.filter((i) => i.isDone).length
    const total = checklist.items.length
    const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0
    const allDone = total > 0 && doneCount === total

    function saveTitle() {
        const trimmed = titleVal.trim()
        if (trimmed && trimmed !== checklist.title) {
            onUpdate({ ...checklist, title: trimmed })
        } else {
            setTitleVal(checklist.title)
        }
        setEditingTitle(false)
    }

    function addItem() {
        const trimmed = newItemVal.trim()
        if (!trimmed) return
        const newItem: ChecklistItem = { id: generateId(), label: trimmed, isDone: false }
        onUpdate({ ...checklist, items: [...checklist.items, newItem] })
        setNewItemVal('')
        newItemRef.current?.focus()
    }

    function saveItemEdit(itemId: string) {
        const trimmed = editingItemVal.trim()
        if (trimmed) {
            onUpdate({
                ...checklist,
                items: checklist.items.map((i) => i.id === itemId ? { ...i, label: trimmed } : i),
            })
        }
        setEditingItemId(null)
    }

    function deleteItem(itemId: string) {
        onUpdate({ ...checklist, items: checklist.items.filter((i) => i.id !== itemId) })
    }

    return (
        <div className={`flex flex-col bg-surface border rounded-2xl overflow-hidden transition-colors duration-150 ${allDone ? 'border-green-800/50' : 'border-border'}`}>
            {/* Card header */}
            <div className={`px-4 pt-4 pb-3 ${!collapsed ? 'border-b border-border' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    {editingTitle ? (
                        <input
                            autoFocus
                            value={titleVal}
                            onChange={(e) => setTitleVal(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleVal(checklist.title); setEditingTitle(false) } }}
                            className="flex-1 bg-surface2 border border-border2 rounded-lg px-2 py-1 text-[15px] font-semibold text-text focus:outline-none"
                        />
                    ) : (
                        <h3
                            className="flex-1 font-semibold text-[15px] text-text leading-snug cursor-pointer hover:text-text2 transition-colors"
                            onClick={() => { setEditingTitle(true); setTitleVal(checklist.title) }}
                        >
                            {checklist.title}
                        </h3>
                    )}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {!collapsed && total > 0 && (
                            <button
                                onClick={() => onReset(checklist.id)}
                                className="text-[11px] text-text3 hover:text-text2 px-2 py-1 rounded-lg hover:bg-surface2 transition-all"
                                title="Reset all items"
                            >
                                Reset
                            </button>
                        )}
                        <button
                            onClick={() => setCollapsed((c) => !c)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-text3 hover:bg-surface2 hover:text-text transition-all"
                            title={collapsed ? 'Expand' : 'Collapse'}
                        >
                            <ChevronDown
                                size={10}
                                strokeWidth={1.5}
                                className={`transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
                            />
                        </button>
                        <button
                            onClick={() => onDelete(checklist.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-text3 hover:bg-surface2 hover:text-text transition-all"
                            title="Delete checklist"
                        >
                            <X size={10} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Progress */}
                {!collapsed && total > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface3 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${allDone ? 'bg-green-500' : 'bg-text2'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-text3 flex-shrink-0">{doneCount}/{total}</span>
                    </div>
                )}
            </div>

            {/* Items */}
            {!collapsed && <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
                {checklist.items.length === 0 && (
                    <p className="text-[13px] text-text3 italic py-2 px-1">No items yet — add one below</p>
                )}
                {checklist.items.map((item) => (
                    <div key={item.id} className="group flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-surface2/50 transition-colors">
                        <button
                            onClick={() => {
                                const willComplete = !item.isDone && checklist.items.every(i => i.id === item.id || i.isDone)
                                onToggleItem(checklist.id, item.id)
                                if (willComplete) onComplete?.()
                            }}
                            className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all duration-150 ${item.isDone ? 'bg-green-600 border-green-600' : 'border-border2 hover:border-text3'}`}
                        >
                            {item.isDone && (
                                <Check size={8} stroke="white" strokeWidth={2} />
                            )}
                        </button>

                        {editingItemId === item.id ? (
                            <input
                                autoFocus
                                value={editingItemVal}
                                onChange={(e) => setEditingItemVal(e.target.value)}
                                onBlur={() => saveItemEdit(item.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter') saveItemEdit(item.id); if (e.key === 'Escape') setEditingItemId(null) }}
                                className="flex-1 bg-surface2 border border-border2 rounded px-1.5 py-0.5 text-[13px] text-text focus:outline-none"
                            />
                        ) : (
                            <span
                                className={`flex-1 text-[13px] leading-relaxed cursor-pointer ${item.isDone ? 'line-through text-text3' : 'text-text'}`}
                                onDoubleClick={() => { setEditingItemId(item.id); setEditingItemVal(item.label) }}
                            >
                                {item.label}
                            </span>
                        )}

                        <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-text3 hover:text-text transition-all flex-shrink-0"
                        >
                            <X size={9} strokeWidth={1.5} />
                        </button>
                    </div>
                ))}

                {/* Add item input */}
                <div className="flex items-center gap-2 mt-1 px-1">
                    <div className="w-4 h-4 rounded border border-dashed border-border flex-shrink-0" />
                    <input
                        ref={newItemRef}
                        type="text"
                        value={newItemVal}
                        onChange={(e) => setNewItemVal(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
                        placeholder="Add item…"
                        className="flex-1 bg-transparent text-[13px] text-text placeholder:text-text3 focus:outline-none py-1"
                    />
                    {newItemVal.trim() && (
                        <button
                            onClick={addItem}
                            className="text-[11px] font-medium text-text2 hover:text-text px-1.5 py-0.5 rounded transition-colors"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>}
        </div>
    )
}

function ChecklistsContent() {
    const toggle = useSidebarToggle()
    const store = useStore()
    const { showToast } = useToast()
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Checklist | null>(null)

    const templates = useMemo(() => store.checklists.filter((c) => c.isTemplate), [store.checklists])
    const myChecklists = useMemo(() => store.checklists.filter((c) => !c.isTemplate), [store.checklists])
    const allCategories = useMemo(
        () => Array.from(new Set(store.checklists.map((c) => c.category).filter(Boolean))),
        [store.checklists]
    )

    function openCreate() {
        setEditTarget(null)
        setModalOpen(true)
    }

    function openEdit(checklist: Checklist) {
        setEditTarget(checklist)
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
        setEditTarget(null)
    }

    function handleSaveModal(data: { title: string; description: string; category: string; isTemplate: boolean; items: ChecklistItem[] }) {
        if (editTarget) {
            store.updateChecklist({ ...editTarget, ...data })
            showToast(editTarget.isTemplate ? 'Template updated' : 'Checklist updated')
        } else {
            store.addChecklist(data)
            showToast(data.isTemplate ? 'Template created' : 'Checklist created')
        }
        closeModal()
    }

    function handleUseTemplate(tpl: Checklist) {
        store.addChecklist({
            title: tpl.title,
            description: tpl.description,
            category: tpl.category,
            isTemplate: false,
            items: tpl.items.map((item) => ({ id: generateId(), label: item.label, isDone: false })),
        })
        showToast(`"${tpl.title}" added from template`)
    }

    function handleDeleteTemplate(id: string) {
        store.deleteChecklist(id)
        showToast('Template deleted')
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0">
                <Topbar
                    title={<h1 className="font-semibold text-[22px] leading-tight text-text">Checklists</h1>}
                    onMenuClick={toggle}
                    extra={
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 bg-text text-bg text-[13px] font-medium rounded-xl px-4 py-2 hover:opacity-85 transition-all duration-150 active:scale-[0.98]"
                        >
                            <Plus size={14} strokeWidth={1.5} />
                            New Checklist
                        </button>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-hidden">
                {/* Templates section — always visible */}
                <div className="flex-shrink-0">
                    <TemplatesSection
                        templates={templates}
                        onUse={handleUseTemplate}
                        onEdit={openEdit}
                        onDelete={handleDeleteTemplate}
                    />
                </div>

                {/* My Checklists section */}
                <div className="flex flex-col gap-3 min-h-0 flex-1">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-medium text-text3 uppercase tracking-[0.08em]">My Checklists</span>
                        {myChecklists.length > 0 && (
                            <span className="bg-surface3 text-text font-semibold text-[10px] px-1.5 py-px rounded-full">
                                {myChecklists.length}
                            </span>
                        )}
                    </div>

                    {myChecklists.length === 0 ? (
                        <div className="flex items-center justify-center py-10 border border-dashed border-border rounded-2xl">
                            <div className="text-center">
                                <p className="text-[13px] text-text3 mb-3">No checklists yet — create one or use a template above.</p>
                                <button
                                    onClick={openCreate}
                                    className="inline-flex items-center gap-1.5 bg-text text-bg text-[13px] font-medium rounded-xl px-4 py-2 hover:opacity-85 transition-all"
                                >
                                    Create from scratch
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {myChecklists.map((cl) => (
                                    <ChecklistCard
                                        key={cl.id}
                                        checklist={cl}
                                        onUpdate={store.updateChecklist}
                                        onDelete={(id) => { store.deleteChecklist(id); showToast('Checklist deleted') }}
                                        onToggleItem={store.toggleChecklistItem}
                                        onReset={(id) => { store.resetChecklist(id); showToast('Checklist reset') }}
                                        onComplete={store.settings.confettiOnDone ? store.triggerConfetti : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddChecklistModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSave={handleSaveModal}
                initial={editTarget ?? undefined}
                existingCategories={allCategories}
                mode={editTarget ? 'edit' : 'create'}
            />
        </div>
    )
}

export default function ChecklistsPage() {
    return (
        <AppShell>
            <ChecklistsContent />
        </AppShell>
    )
}
