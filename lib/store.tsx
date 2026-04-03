'use client'

import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useMemo,
    useState,
    useRef,
    ReactNode,
    useCallback,
} from 'react'
import { Task, Sprint, Checkin, Checklist, ChecklistItem, AppState, Settings, DEFAULT_SETTINGS } from './types'
import { toDateString, isToday, isThisWeek, isOverdue, isWithinDays, daysSince } from './utils/dates'
import { sortTasks } from './utils/sort'
import { CHECKLIST_TEMPLATES } from './checklistTemplates'
import { useToast } from '@/components/ui/Toast'

// ─── DB imports ──────────────────────────────────────
import { fetchTasks as dbFetchTasks, insertTask as dbInsertTask, updateTask as dbUpdateTask, deleteTask as dbDeleteTask } from './db/tasks'
import { fetchActiveSprint as dbFetchActiveSprint, upsertSprint as dbUpsertSprint, updateSprintNotes as dbUpdateSprintNotes } from './db/sprints'
import { fetchCheckins as dbFetchCheckins, insertCheckin as dbInsertCheckin, updateCheckin as dbUpdateCheckin, deleteCheckin as dbDeleteCheckin } from './db/checkins'
import { fetchChecklists as dbFetchChecklists, insertChecklist as dbInsertChecklist, updateChecklist as dbUpdateChecklist, deleteChecklist as dbDeleteChecklist, toggleChecklistItem as dbToggleChecklistItem, resetChecklistItems as dbResetChecklistItems } from './db/checklists'
import { fetchSettings as dbFetchSettings, upsertSettings as dbUpsertSettings } from './db/settings'

// ─── Actions ─────────────────────────────────────────

type Action =
    | { type: 'INIT'; payload: AppState }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'TOGGLE_DONE'; payload: string }
    | { type: 'PIN_TASK'; payload: string }
    | { type: 'UNPIN_TASK'; payload: string }
    | { type: 'DISMISS_CARRIED'; payload: string }
    | { type: 'SET_SPRINT'; payload: Sprint }
    | { type: 'UPDATE_SPRINT_NOTES'; payload: string }
    | { type: 'SAVE_CHECKIN'; payload: Checkin }
    | { type: 'UPDATE_CHECKIN'; payload: Checkin }
    | { type: 'DELETE_CHECKIN'; payload: string }
    | { type: 'ADD_CHECKLIST'; payload: Checklist }
    | { type: 'UPDATE_CHECKLIST'; payload: Checklist }
    | { type: 'DELETE_CHECKLIST'; payload: string }
    | { type: 'TOGGLE_CHECKLIST_ITEM'; payload: { checklistId: string; itemId: string } }
    | { type: 'RESET_CHECKLIST'; payload: string }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
    | { type: 'APPEND_CHECKINS'; payload: Checkin[] }
    | { type: 'BULK_UPDATE'; payload: AppState }

function generateId(): string {
    return crypto.randomUUID()
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUUID(id: string): boolean {
    return UUID_RE.test(id)
}

// ─── Reducer ─────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'INIT':
            return action.payload

        case 'ADD_TASK':
            return { ...state, tasks: [...state.tasks, action.payload] }

        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
                ),
            }

        case 'DELETE_TASK':
            return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) }

        case 'TOGGLE_DONE': {
            return {
                ...state,
                tasks: state.tasks.map((t) => {
                    if (t.id !== action.payload) return t
                    const nowDone = !t.isDone
                    return {
                        ...t,
                        isDone: nowDone,
                        doneAt: nowDone ? new Date().toISOString() : null,
                        isPinnedToday: nowDone ? false : t.isPinnedToday,
                    }
                }),
            }
        }

        case 'PIN_TASK': {
            const today = toDateString(new Date())
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    t.id === action.payload
                        ? { ...t, isPinnedToday: true, pinnedDate: today, carriedOver: false }
                        : t
                ),
            }
        }

        case 'UNPIN_TASK':
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    t.id === action.payload
                        ? { ...t, isPinnedToday: false, pinnedDate: null }
                        : t
                ),
            }

        case 'DISMISS_CARRIED':
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    t.id === action.payload ? { ...t, carriedOver: false } : t
                ),
            }

        case 'SET_SPRINT':
            return { ...state, sprint: action.payload }

        case 'UPDATE_SPRINT_NOTES':
            return state.sprint
                ? { ...state, sprint: { ...state.sprint, notes: action.payload } }
                : state

        case 'SAVE_CHECKIN':
            return { ...state, checkins: [action.payload, ...state.checkins] }

        case 'UPDATE_CHECKIN':
            return {
                ...state,
                checkins: state.checkins.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
            }

        case 'DELETE_CHECKIN':
            return { ...state, checkins: state.checkins.filter((c) => c.id !== action.payload) }

        case 'ADD_CHECKLIST':
            return { ...state, checklists: [...(state.checklists ?? []), action.payload] }

        case 'UPDATE_CHECKLIST':
            return {
                ...state,
                checklists: (state.checklists ?? []).map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
            }

        case 'DELETE_CHECKLIST':
            return { ...state, checklists: (state.checklists ?? []).filter((c) => c.id !== action.payload) }

        case 'TOGGLE_CHECKLIST_ITEM':
            return {
                ...state,
                checklists: (state.checklists ?? []).map((c) =>
                    c.id === action.payload.checklistId
                        ? {
                            ...c,
                            items: c.items.map((item) =>
                                item.id === action.payload.itemId
                                    ? { ...item, isDone: !item.isDone }
                                    : item
                            ),
                        }
                        : c
                ),
            }

        case 'RESET_CHECKLIST':
            return {
                ...state,
                checklists: (state.checklists ?? []).map((c) =>
                    c.id === action.payload
                        ? { ...c, items: c.items.map((item) => ({ ...item, isDone: false })) }
                        : c
                ),
            }

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: { ...state.settings, ...action.payload },
            }

        case 'APPEND_CHECKINS':
            return { ...state, checkins: [...state.checkins, ...action.payload] }

        case 'BULK_UPDATE':
            return action.payload

        default:
            return state
    }
}

// ─── Init logic ──────────────────────────────────────

function processInitState(state: AppState): AppState {
    const today = toDateString(new Date())
    let tasks = state.tasks

    // If no active sprint, remove sprint tags from all tasks
    if (!state.sprint || !state.sprint.isActive) {
        tasks = tasks.map((t) => t.sprintId ? { ...t, sprintId: null } : t)
    }

    // Auto-unpin stale pins and mark as carried over
    tasks = tasks.map((t) => {
        if (t.isPinnedToday && t.pinnedDate && t.pinnedDate < today && !t.isDone) {
            return { ...t, isPinnedToday: false, carriedOver: true }
        }
        return t
    })

    // Auto-delete done tasks older than 7 days
    tasks = tasks.filter((t) => {
        if (t.isDone && t.doneAt && daysSince(t.doneAt) >= 7) return false
        return true
    })

    return { ...state, tasks }
}

function seedTemplates(): Checklist[] {
    return CHECKLIST_TEMPLATES.map((tpl) => ({
        id: tpl.id,
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        isTemplate: true,
        items: tpl.items.map((label, i) => ({ id: `${tpl.id}-item-${i}`, label, isDone: false })),
        createdAt: new Date().toISOString(),
    }))
}

const initialState: AppState = {
    tasks: [],
    sprint: null,
    checkins: [],
    checklists: [],
    settings: DEFAULT_SETTINGS,
}

// ─── Context ─────────────────────────────────────────

interface StoreContextValue {
    tasks: Task[]
    sprint: Sprint | null
    checkins: Checkin[]
    checklists: Checklist[]
    isLoading: boolean

    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    toggleDone: (id: string) => void
    pinTask: (id: string) => boolean
    unpinTask: (id: string) => void
    dismissCarriedOver: (id: string) => void

    setSprint: (sprint: Omit<Sprint, 'id'> & { id?: string }) => void
    updateSprintNotes: (notes: string) => void

    saveCheckin: (checkin: Omit<Checkin, 'id'>) => void
    updateCheckin: (checkin: Checkin) => void
    deleteCheckin: (id: string) => void
    loadMoreCheckins: (offset: number) => Promise<void>

    addChecklist: (config: { title: string; description?: string; category?: string; isTemplate?: boolean; items?: ChecklistItem[] }) => void
    updateChecklist: (checklist: Checklist) => void
    deleteChecklist: (id: string) => void
    toggleChecklistItem: (checklistId: string, itemId: string) => void
    resetChecklist: (id: string) => void

    settings: Settings
    updateSettings: (updates: Partial<Settings>) => void

    confettiKey: number
    confettiBucket: string | null
    triggerConfetti: (bucket?: string) => void

    hasCheckedInToday: boolean
    todayPinned: Task[]
    todayUnpinned: Task[]
    carriedOver: Task[]
    thisWeekTasks: Task[]
    overdueTasks: Task[]
    doneTasks: Task[]
    recentTasks: Task[]
    openCount: number
    overdueCount: number
    workCount: number
    learnCount: number
    lifeCount: number
}

const StoreContext = createContext<StoreContextValue | null>(null)

// ─── Provider ────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const [isLoading, setIsLoading] = useState(true)
    const { showToast } = useToast()

    // Refs for accessing latest state/toast in stable callbacks
    const stateRef = useRef(state)
    stateRef.current = state
    const showToastRef = useRef(showToast)
    showToastRef.current = showToast

    // ─── Init: fetch all data in parallel ────────────────
    useEffect(() => {
        let cancelled = false

        async function init() {
            try {
                const [tasks, sprint, checklists, checkins, settings] = await Promise.all([
                    dbFetchTasks(),
                    dbFetchActiveSprint(),
                    dbFetchChecklists(),
                    dbFetchCheckins(20, 0),
                    dbFetchSettings(),
                ])
                if (cancelled) return

                const templates = seedTemplates()
                const mergedChecklists = [...templates, ...checklists]

                dispatch({
                    type: 'INIT',
                    payload: processInitState({
                        tasks,
                        sprint,
                        checkins,
                        checklists: mergedChecklists,
                        settings,
                    }),
                })
            } catch (err: any) {
                if (!cancelled) showToastRef.current(`Failed to load data: ${err.message}`)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        init()
        return () => { cancelled = true }
    }, [])

    // ─── Window focus re-sync ────────────────────────────
    useEffect(() => {
        async function handleVisibilityChange() {
            if (document.visibilityState !== 'visible') return
            try {
                const [tasks, sprint] = await Promise.all([
                    dbFetchTasks(),
                    dbFetchActiveSprint(),
                ])
                const current = stateRef.current
                dispatch({
                    type: 'BULK_UPDATE',
                    payload: processInitState({
                        ...current,
                        tasks,
                        sprint,
                    }),
                })
            } catch {
                // Silent fail on background sync
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    // Refresh "today" at midnight so computed values stay correct
    const [today, setToday] = useState(() => toDateString(new Date()))
    useEffect(() => {
        const now = new Date()
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        const msUntilMidnight = tomorrow.getTime() - now.getTime()
        const timeout = setTimeout(() => {
            setToday(toDateString(new Date()))
            // After initial midnight tick, refresh every 60s to catch date changes
            const interval = setInterval(() => setToday(toDateString(new Date())), 60_000)
            return () => clearInterval(interval)
        }, msUntilMidnight)
        return () => clearTimeout(timeout)
    }, [today])

    // ─── Task actions ────────────────────────────────────

    const addTask = useCallback(
        (task: Omit<Task, 'id' | 'createdAt'>) => {
            const newTask: Task = {
                ...task,
                id: generateId(),
                createdAt: new Date().toISOString(),
            }
            dispatch({ type: 'ADD_TASK', payload: newTask })
            dbInsertTask(newTask).catch((err) => {
                showToastRef.current(`Failed to save task: ${err.message}`)
            })
        },
        []
    )

    const updateTask = useCallback(
        (id: string, updates: Partial<Task>) => {
            dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
            dbUpdateTask(id, updates).catch((err) => {
                showToastRef.current(`Failed to update task: ${err.message}`)
            })
        },
        []
    )

    const deleteTask = useCallback(
        (id: string) => {
            dispatch({ type: 'DELETE_TASK', payload: id })
            dbDeleteTask(id).catch((err) => {
                showToastRef.current(`Failed to delete task: ${err.message}`)
            })
        },
        []
    )

    const toggleDone = useCallback(
        (id: string) => {
            const task = stateRef.current.tasks.find((t) => t.id === id)
            if (!task) return
            const nowDone = !task.isDone
            const updates: Partial<Task> = {
                isDone: nowDone,
                doneAt: nowDone ? new Date().toISOString() : null,
                isPinnedToday: nowDone ? false : task.isPinnedToday,
                ...(!nowDone && task.sprintId ? { sprintId: null } : {}),
            }
            dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
            dbUpdateTask(id, updates).catch((err) => {
                showToastRef.current(`Failed to update task: ${err.message}`)
            })
        },
        []
    )

    const pinTask = useCallback(
        (id: string): boolean => {
            const todayStr = toDateString(new Date())
            dispatch({ type: 'PIN_TASK', payload: id })
            dbUpdateTask(id, { isPinnedToday: true, pinnedDate: todayStr, carriedOver: false }).catch((err) => {
                showToastRef.current(`Failed to pin task: ${err.message}`)
            })
            return true
        },
        []
    )

    const unpinTask = useCallback(
        (id: string) => {
            dispatch({ type: 'UNPIN_TASK', payload: id })
            dbUpdateTask(id, { isPinnedToday: false, pinnedDate: null }).catch((err) => {
                showToastRef.current(`Failed to unpin task: ${err.message}`)
            })
        },
        []
    )

    const dismissCarriedOver = useCallback(
        (id: string) => {
            dispatch({ type: 'DISMISS_CARRIED', payload: id })
            dbUpdateTask(id, { carriedOver: false }).catch((err) => {
                showToastRef.current(`Failed to update task: ${err.message}`)
            })
        },
        []
    )

    // ─── Sprint actions ──────────────────────────────────

    const setSprint = useCallback(
        (sprint: Omit<Sprint, 'id'> & { id?: string }) => {
            const newSprint: Sprint = { ...sprint, id: sprint.id ?? generateId() }
            dispatch({ type: 'SET_SPRINT', payload: newSprint })
            dbUpsertSprint(newSprint).catch((err) => {
                showToastRef.current(`Failed to save sprint: ${err.message}`)
            })
        },
        []
    )

    const updateSprintNotes = useCallback(
        (notes: string) => {
            dispatch({ type: 'UPDATE_SPRINT_NOTES', payload: notes })
            const sprint = stateRef.current.sprint
            if (sprint) {
                dbUpdateSprintNotes(sprint.id, notes).catch((err) => {
                    showToastRef.current(`Failed to update sprint notes: ${err.message}`)
                })
            }
        },
        []
    )

    // ─── Check-in actions ────────────────────────────────

    const saveCheckin = useCallback(
        (checkin: Omit<Checkin, 'id'>) => {
            const existing = stateRef.current.checkins.find((c) => c.date === checkin.date)
            if (existing) {
                const updated = { ...existing, ...checkin }
                dispatch({ type: 'UPDATE_CHECKIN', payload: updated })
                dbUpdateCheckin(updated).catch((err) => {
                    showToastRef.current(`Failed to update check-in: ${err.message}`)
                })
            } else {
                const newCheckin: Checkin = { ...checkin, id: generateId() }
                dispatch({ type: 'SAVE_CHECKIN', payload: newCheckin })
                dbInsertCheckin(newCheckin).catch((err) => {
                    showToastRef.current(`Failed to save check-in: ${err.message}`)
                })
            }
        },
        []
    )

    const updateCheckin = useCallback(
        (checkin: Checkin) => {
            dispatch({ type: 'UPDATE_CHECKIN', payload: checkin })
            dbUpdateCheckin(checkin).catch((err) => {
                showToastRef.current(`Failed to update check-in: ${err.message}`)
            })
        },
        []
    )

    const deleteCheckin = useCallback(
        (id: string) => {
            dispatch({ type: 'DELETE_CHECKIN', payload: id })
            dbDeleteCheckin(id).catch((err) => {
                showToastRef.current(`Failed to delete check-in: ${err.message}`)
            })
        },
        []
    )

    const loadMoreCheckins = useCallback(
        async (offset: number) => {
            try {
                const more = await dbFetchCheckins(20, offset)
                if (more.length > 0) {
                    dispatch({ type: 'APPEND_CHECKINS', payload: more })
                }
            } catch (err: any) {
                showToastRef.current(`Failed to load check-ins: ${err.message}`)
            }
        },
        []
    )

    // ─── Checklist actions ───────────────────────────────

    const addChecklist = useCallback(
        (config: { title: string; description?: string; category?: string; isTemplate?: boolean; items?: ChecklistItem[] }) => {
            const newChecklist: Checklist = {
                id: generateId(),
                title: config.title,
                description: config.description ?? '',
                category: config.category ?? '',
                isTemplate: config.isTemplate ?? false,
                items: config.items ?? [],
                createdAt: new Date().toISOString(),
            }
            dispatch({ type: 'ADD_CHECKLIST', payload: newChecklist })
            if (!newChecklist.isTemplate) {
                dbInsertChecklist(newChecklist).catch((err) => {
                    showToastRef.current(`Failed to save checklist: ${err.message}`)
                })
            }
        },
        []
    )

    const updateChecklist = useCallback(
        (checklist: Checklist) => {
            dispatch({ type: 'UPDATE_CHECKLIST', payload: checklist })
            if (!checklist.isTemplate) {
                dbUpdateChecklist(checklist).catch((err) => {
                    showToastRef.current(`Failed to update checklist: ${err.message}`)
                })
            }
        },
        []
    )

    const deleteChecklist = useCallback(
        (id: string) => {
            const checklist = stateRef.current.checklists.find((c) => c.id === id)
            dispatch({ type: 'DELETE_CHECKLIST', payload: id })
            if (checklist && !checklist.isTemplate) {
                dbDeleteChecklist(id).catch((err) => {
                    showToastRef.current(`Failed to delete checklist: ${err.message}`)
                })
            }
        },
        []
    )

    const toggleChecklistItem = useCallback(
        (checklistId: string, itemId: string) => {
            const checklist = stateRef.current.checklists.find((c) => c.id === checklistId)
            dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: { checklistId, itemId } })
            if (checklist && !checklist.isTemplate) {
                const item = checklist.items.find((i) => i.id === itemId)
                if (item && isUUID(item.id)) {
                    dbToggleChecklistItem(itemId, !item.isDone).catch((err) => {
                        showToastRef.current(`Failed to toggle item: ${err.message}`)
                    })
                }
            }
        },
        []
    )

    const resetChecklist = useCallback(
        (id: string) => {
            const checklist = stateRef.current.checklists.find((c) => c.id === id)
            dispatch({ type: 'RESET_CHECKLIST', payload: id })
            if (checklist && !checklist.isTemplate) {
                dbResetChecklistItems(id).catch((err) => {
                    showToastRef.current(`Failed to reset checklist: ${err.message}`)
                })
            }
        },
        []
    )

    // ─── Settings ────────────────────────────────────────

    const updateSettings = useCallback(
        (updates: Partial<Settings>) => {
            dispatch({ type: 'UPDATE_SETTINGS', payload: updates })
            const merged = { ...stateRef.current.settings, ...updates }
            dbUpsertSettings(merged).catch((err) => {
                showToastRef.current(`Failed to save settings: ${err.message}`)
            })
        },
        []
    )

    const [confettiKey, setConfettiKey] = useState(0)
    const [confettiBucket, setConfettiBucket] = useState<string | null>(null)
    const triggerConfetti = useCallback((bucket?: string) => {
        setConfettiBucket(bucket ?? null)
        setConfettiKey((k) => k + 1)
    }, [])

    // ─── Computed values ───────────────────────────────

    const hasCheckedInToday = useMemo(
        () => state.checkins.some((c) => c.date === today),
        [state.checkins, today]
    )

    const todayPinned = useMemo(
        () =>
            sortTasks(
                state.tasks.filter(
                    (t) => t.isPinnedToday && t.pinnedDate === today && !t.isDone
                )
            ),
        [state.tasks, today]
    )

    const todayUnpinned = useMemo(
        () =>
            sortTasks(
                state.tasks.filter(
                    (t) =>
                        !t.isPinnedToday &&
                        !t.carriedOver &&
                        !t.isDone &&
                        t.deadline !== null &&
                        isToday(t.deadline)
                )
            ),
        [state.tasks]
    )

    const carriedOver = useMemo(
        () => state.tasks.filter((t) => t.carriedOver && !t.isDone),
        [state.tasks]
    )

    const thisWeekTasks = useMemo(
        () => {
            const filtered = state.tasks.filter(
                (t) =>
                    !t.isDone &&
                    !t.carriedOver &&
                    !t.isPinnedToday &&
                    !(t.deadline !== null && isToday(t.deadline))
            )
            // Sort by date ascending (nearest first), tasks with no deadline at bottom
            return [...filtered].sort((a, b) => {
                if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
                if (a.deadline && !b.deadline) return -1
                if (!a.deadline && b.deadline) return 1
                return a.createdAt.localeCompare(b.createdAt)
            })
        },
        [state.tasks]
    )

    const overdueTasks = useMemo(
        () =>
            state.tasks.filter(
                (t) => !t.isDone && t.deadline !== null && isOverdue(t.deadline)
            ),
        [state.tasks]
    )

    const doneTasks = useMemo(
        () =>
            state.tasks
                .filter((t) => t.isDone)
                .sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? '')),
        [state.tasks]
    )

    const recentTasks = useMemo(
        () =>
            state.tasks
                .filter((t) => isWithinDays(t.createdAt, 7))
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        [state.tasks]
    )

    const openCount = useMemo(
        () => state.tasks.filter((t) => !t.isDone).length,
        [state.tasks]
    )

    const overdueCount = useMemo(() => overdueTasks.length, [overdueTasks])

    const workCount = useMemo(
        () => state.tasks.filter((t) => !t.isDone && t.bucket === 'work').length,
        [state.tasks]
    )

    const learnCount = useMemo(
        () => state.tasks.filter((t) => !t.isDone && t.bucket === 'learn').length,
        [state.tasks]
    )

    const lifeCount = useMemo(
        () => state.tasks.filter((t) => !t.isDone && t.bucket === 'life').length,
        [state.tasks]
    )

    const value = useMemo<StoreContextValue>(
        () => ({
            tasks: state.tasks,
            sprint: state.sprint,
            checkins: state.checkins,
            checklists: state.checklists ?? [],
            isLoading,
            addTask,
            updateTask,
            deleteTask,
            toggleDone,
            pinTask,
            unpinTask,
            dismissCarriedOver,
            setSprint,
            updateSprintNotes,
            saveCheckin,
            updateCheckin,
            deleteCheckin,
            loadMoreCheckins,
            addChecklist,
            updateChecklist,
            deleteChecklist,
            toggleChecklistItem,
            resetChecklist,
            settings: state.settings,
            updateSettings,
            confettiKey,
            confettiBucket,
            triggerConfetti,
            hasCheckedInToday,
            todayPinned,
            todayUnpinned,
            carriedOver,
            thisWeekTasks,
            overdueTasks,
            doneTasks,
            recentTasks,
            openCount,
            overdueCount,
            workCount,
            learnCount,
            lifeCount,
        }),
        [
            state,
            isLoading,
            addTask,
            updateTask,
            deleteTask,
            toggleDone,
            pinTask,
            unpinTask,
            dismissCarriedOver,
            setSprint,
            updateSprintNotes,
            saveCheckin,
            updateCheckin,
            deleteCheckin,
            loadMoreCheckins,
            addChecklist,
            updateChecklist,
            deleteChecklist,
            toggleChecklistItem,
            resetChecklist,
            updateSettings,
            confettiKey,
            confettiBucket,
            triggerConfetti,
            hasCheckedInToday,
            todayPinned,
            todayUnpinned,
            carriedOver,
            thisWeekTasks,
            overdueTasks,
            doneTasks,
            recentTasks,
            openCount,
            overdueCount,
            workCount,
            learnCount,
            lifeCount,
        ]
    )

    return <StoreContext.Provider value={value}> {children} </StoreContext.Provider>
}

export function useStore(): StoreContextValue {
    const ctx = useContext(StoreContext)
    if (!ctx) throw new Error('useStore must be used within StoreProvider')
    return ctx
}
