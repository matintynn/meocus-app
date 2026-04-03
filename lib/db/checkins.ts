import { createClient } from '@/lib/supabase'
import { Checkin } from '@/lib/types'

async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return { supabase, user }
}

interface CheckinRow {
    id: string
    date: string
    proud: string
    tomorrow: string
    notes: string
    user_id: string
}

function toCheckin(row: CheckinRow): Checkin {
    return {
        id: row.id,
        date: row.date,
        proud: row.proud,
        tomorrow: row.tomorrow,
        notes: row.notes,
    }
}

function toRow(checkin: Checkin, userId: string): Record<string, unknown> {
    return {
        id: checkin.id,
        date: checkin.date,
        proud: checkin.proud,
        tomorrow: checkin.tomorrow,
        notes: checkin.notes,
        user_id: userId,
    }
}

export async function fetchCheckins(limit: number, offset: number): Promise<Checkin[]> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1)
    if (error) throw error
    return (data as CheckinRow[]).map(toCheckin)
}

export async function insertCheckin(checkin: Checkin): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('checkins')
        .insert(toRow(checkin, user.id))
    if (error) throw error
}

export async function updateCheckin(checkin: Checkin): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('checkins')
        .update(toRow(checkin, user.id))
        .eq('id', checkin.id)
        .eq('user_id', user.id)
    if (error) throw error
}

export async function deleteCheckin(id: string): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    if (error) throw error
}
