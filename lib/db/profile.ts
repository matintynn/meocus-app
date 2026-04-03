import { createClient } from '@/lib/supabase'

export interface Profile {
    userId: string
    name: string
    updatedAt: string
}

interface ProfileRow {
    user_id: string
    name: string
    updated_at: string
}

function toProfile(row: ProfileRow): Profile {
    return {
        userId: row.user_id,
        name: row.name,
        updatedAt: row.updated_at,
    }
}

async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return { supabase, user }
}

export async function fetchProfile(): Promise<Profile | null> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
    if (error) throw error
    return data ? toProfile(data as ProfileRow) : null
}

export async function updateProfile(name: string): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, name, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) throw error
}
