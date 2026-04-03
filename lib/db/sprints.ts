import { createClient } from '@/lib/supabase'
import { Sprint } from '@/lib/types'

async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return { supabase, user }
}

interface SprintRow {
    id: string
    title: string
    start_date: string
    end_date: string
    work_goal: string
    learn_goal: string
    life_goal: string
    notes: string
    is_active: boolean
    user_id: string
}

function toSprint(row: SprintRow): Sprint {
    return {
        id: row.id,
        title: row.title,
        startDate: row.start_date,
        endDate: row.end_date,
        workGoal: row.work_goal,
        learnGoal: row.learn_goal,
        lifeGoal: row.life_goal,
        notes: row.notes,
        isActive: row.is_active,
    }
}

function toRow(sprint: Sprint, userId: string): Record<string, unknown> {
    return {
        id: sprint.id,
        title: sprint.title,
        start_date: sprint.startDate,
        end_date: sprint.endDate,
        work_goal: sprint.workGoal,
        learn_goal: sprint.learnGoal,
        life_goal: sprint.lifeGoal,
        notes: sprint.notes,
        is_active: sprint.isActive,
        user_id: userId,
    }
}

export async function fetchActiveSprint(): Promise<Sprint | null> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()
    if (error) throw error
    return data ? toSprint(data as SprintRow) : null
}

export async function upsertSprint(sprint: Sprint): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('sprints')
        .upsert(toRow(sprint, user.id))
    if (error) throw error
}

export async function updateSprintNotes(id: string, notes: string): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('sprints')
        .update({ notes })
        .eq('id', id)
        .eq('user_id', user.id)
    if (error) throw error
}
