import { createClient } from '@/lib/supabase'
import { Checklist, ChecklistItem } from '@/lib/types'

async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return { supabase, user }
}

interface ChecklistItemRow {
    id: string
    checklist_id: string
    label: string
    is_done: boolean
}

interface ChecklistRow {
    id: string
    title: string
    description: string
    category: string
    is_template: boolean
    created_at: string
    user_id: string
    checklist_items?: ChecklistItemRow[]
}

function toChecklistItem(row: ChecklistItemRow): ChecklistItem {
    return {
        id: row.id,
        label: row.label,
        isDone: row.is_done,
    }
}

function toChecklist(row: ChecklistRow): Checklist {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        isTemplate: row.is_template,
        items: (row.checklist_items ?? []).map(toChecklistItem),
        createdAt: row.created_at,
    }
}

export async function fetchChecklists(): Promise<Checklist[]> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
        .from('checklists')
        .select('*, checklist_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    if (error) throw error
    return (data as ChecklistRow[]).map(toChecklist)
}

export async function insertChecklist(checklist: Checklist): Promise<void> {
    const { supabase, user } = await getUser()
    const { error: clError } = await supabase
        .from('checklists')
        .insert({
            id: checklist.id,
            title: checklist.title,
            description: checklist.description,
            category: checklist.category,
            is_template: checklist.isTemplate,
            created_at: checklist.createdAt,
            user_id: user.id,
        })
    if (clError) throw clError

    if (checklist.items.length > 0) {
        const { error: itemsError } = await supabase
            .from('checklist_items')
            .insert(
                checklist.items.map((item) => ({
                    id: item.id,
                    checklist_id: checklist.id,
                    label: item.label,
                    is_done: item.isDone,
                }))
            )
        if (itemsError) throw itemsError
    }
}

export async function updateChecklist(checklist: Checklist): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('checklists')
        .update({
            title: checklist.title,
            description: checklist.description,
            category: checklist.category,
            is_template: checklist.isTemplate,
        })
        .eq('id', checklist.id)
        .eq('user_id', user.id)
    if (error) throw error

    // Replace all items: delete existing then re-insert
    const { error: delError } = await supabase
        .from('checklist_items')
        .delete()
        .eq('checklist_id', checklist.id)
    if (delError) throw delError

    if (checklist.items.length > 0) {
        const { error: itemsError } = await supabase
            .from('checklist_items')
            .insert(
                checklist.items.map((item) => ({
                    id: item.id,
                    checklist_id: checklist.id,
                    label: item.label,
                    is_done: item.isDone,
                }))
            )
        if (itemsError) throw itemsError
    }
}

export async function deleteChecklist(id: string): Promise<void> {
    const { supabase, user } = await getUser()
    // Delete items first (in case no cascade)
    await supabase.from('checklist_items').delete().eq('checklist_id', id)
    const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    if (error) throw error
}

export async function toggleChecklistItem(itemId: string, isDone: boolean): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
        .from('checklist_items')
        .update({ is_done: isDone })
        .eq('id', itemId)
    if (error) throw error
}

export async function resetChecklistItems(checklistId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
        .from('checklist_items')
        .update({ is_done: false })
        .eq('checklist_id', checklistId)
    if (error) throw error
}
