import { createClient } from '@/lib/supabase'
import { Task } from '@/lib/types'

async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return { supabase, user }
}

interface TaskRow {
    id: string
    title: string
    bucket: string
    urgency: string
    deadline: string | null
    is_pinned_today: boolean
    pinned_date: string | null
    carried_over: boolean
    is_done: boolean
    done_at: string | null
    sprint_id: string | null
    notes: string
    created_at: string
    user_id: string
}

function toTask(row: TaskRow): Task {
    return {
        id: row.id,
        title: row.title,
        bucket: row.bucket as Task['bucket'],
        urgency: row.urgency as Task['urgency'],
        deadline: row.deadline,
        isPinnedToday: row.is_pinned_today,
        pinnedDate: row.pinned_date,
        carriedOver: row.carried_over,
        isDone: row.is_done,
        doneAt: row.done_at,
        sprintId: row.sprint_id,
        notes: row.notes,
        createdAt: row.created_at,
    }
}

function toRow(task: Partial<Task> & { id?: string }): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (task.id !== undefined) row.id = task.id
    if (task.title !== undefined) row.title = task.title
    if (task.bucket !== undefined) row.bucket = task.bucket
    if (task.urgency !== undefined) row.urgency = task.urgency
    if ('deadline' in task) row.deadline = task.deadline
    if (task.isPinnedToday !== undefined) row.is_pinned_today = task.isPinnedToday
    if ('pinnedDate' in task) row.pinned_date = task.pinnedDate
    if (task.carriedOver !== undefined) row.carried_over = task.carriedOver
    if (task.isDone !== undefined) row.is_done = task.isDone
    if ('doneAt' in task) row.done_at = task.doneAt
    if ('sprintId' in task) row.sprint_id = task.sprintId
    if (task.notes !== undefined) row.notes = task.notes
    if (task.createdAt !== undefined) row.created_at = task.createdAt
    return row
}

export async function fetchTasks(): Promise<Task[]> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    if (error) throw error
    return (data as TaskRow[]).map(toTask)
}

export async function insertTask(task: Task): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('tasks')
        .insert({ ...toRow(task), user_id: user.id })
    if (error) throw error
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('tasks')
        .update(toRow(updates))
        .eq('id', id)
        .eq('user_id', user.id)
    if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    if (error) throw error
}
