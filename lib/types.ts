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

export interface AppState {
    tasks: Task[]
    sprint: Sprint | null
    checkins: Checkin[]
}
