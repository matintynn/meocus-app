import { createClient } from '@/lib/supabase'
import { Settings, DEFAULT_SETTINGS } from '@/lib/types'

async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    return { supabase, user }
}

interface SettingsRow {
    user_id: string
    confetti_on_done: boolean
    show_carried_over_banner: boolean
}

function toSettings(row: SettingsRow): Settings {
    return {
        confettiOnDone: row.confetti_on_done,
        showCarriedOverBanner: row.show_carried_over_banner,
    }
}

export async function fetchSettings(): Promise<Settings> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
    if (error) throw error
    return data ? toSettings(data as SettingsRow) : DEFAULT_SETTINGS
}

export async function upsertSettings(settings: Settings): Promise<void> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
        .from('settings')
        .upsert({
            user_id: user.id,
            confetti_on_done: settings.confettiOnDone,
            show_carried_over_banner: settings.showCarriedOverBanner,
        })
    if (error) throw error
}
