export type Bucket = 'work' | 'learn' | 'life'
export type Urgency = 'urgent' | 'normal' | 'someday'

export interface Task {
    id: string
    title: string
    bucket: Bucket
    urgency: Urgency
    deadline: string | null
    isPinnedToday: boolean
    pinnedDate: string | null
    carriedOver: boolean
    isDone: boolean
    doneAt: string | null
    sprintId: string | null
    notes: string
    createdAt: string
}

export interface Sprint {
    id: string
    title: string
    startDate: string
    endDate: string
    workGoal: string
    learnGoal: string
    lifeGoal: string
    notes: string
    isActive: boolean
}

export interface Checkin {
    id: string
    date: string
    proud: string
    tomorrow: string
    notes: string
}

export interface ChecklistItem {
    id: string
    label: string
    isDone: boolean
}

export interface Checklist {
    id: string
    title: string
    description: string
    category: string
    isTemplate: boolean
    items: ChecklistItem[]
    createdAt: string
}

export interface Settings {
    confettiOnDone: boolean
    showCarriedOverBanner: boolean
}

export const DEFAULT_SETTINGS: Settings = {
    confettiOnDone: true,
    showCarriedOverBanner: true,
}

export interface AppState {
    tasks: Task[]
    sprint: Sprint | null
    checkins: Checkin[]
    checklists: Checklist[]
    settings: Settings
}
