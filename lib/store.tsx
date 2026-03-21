'use client'

import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useMemo,
    ReactNode,
    useCallback,
} from 'react'
import { Task, Sprint, Checkin, AppState } from './types'
import { mockTasks, mockSprint } from './mockData'
import { toDateString, isToday, isThisWeek, isOverdue, isWithinDays, daysSince } from './utils/dates'
import { sortTasks } from './utils/sort'

const STORAGE_KEY = 'focus_v1'

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
    | { type: 'BULK_UPDATE'; payload: AppState }

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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

function loadState(): AppState {
    if (typeof window === 'undefined') {
        return { tasks: mockTasks, sprint: mockSprint, checkins: [] }
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored) as AppState
            return processInitState(parsed)
        }
    } catch {
        // ignore parse errors
    }
    return processInitState({ tasks: mockTasks, sprint: mockSprint, checkins: [] })
}

// ─── Context ─────────────────────────────────────────

interface StoreContextValue {
    tasks: Task[]
    sprint: Sprint | null
    checkins: Checkin[]

    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    toggleDone: (id: string) => void
    pinTask: (id: string) => boolean
    unpinTask: (id: string) => void
    dismissCarriedOver: (id: string) => void

    setSprint: (sprint: Omit<Sprint, 'id'>) => void
    updateSprintNotes: (notes: string) => void

    saveCheckin: (checkin: Omit<Checkin, 'id'>) => void

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
    const [state, dispatch] = useReducer(reducer, null, () => loadState())

    // Hydrate from localStorage on client mount
    useEffect(() => {
        const loaded = loadState()
        dispatch({ type: 'INIT', payload: loaded })
    }, [])

    // Persist to localStorage on every state change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        }
    }, [state])

    const today = toDateString(new Date())

    const addTask = useCallback(
        (task: Omit<Task, 'id' | 'createdAt'>) => {
            const newTask: Task = {
                ...task,
                id: generateId(),
                createdAt: new Date().toISOString(),
            }
            dispatch({ type: 'ADD_TASK', payload: newTask })
        },
        []
    )

    const updateTask = useCallback(
        (id: string, updates: Partial<Task>) => {
            dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
        },
        []
    )

    const deleteTask = useCallback(
        (id: string) => {
            dispatch({ type: 'DELETE_TASK', payload: id })
        },
        []
    )

    const toggleDone = useCallback(
        (id: string) => {
            dispatch({ type: 'TOGGLE_DONE', payload: id })
        },
        []
    )

    const pinTask = useCallback(
        (id: string): boolean => {
            dispatch({ type: 'PIN_TASK', payload: id })
            return true
        },
        []
    )

    const unpinTask = useCallback(
        (id: string) => {
            dispatch({ type: 'UNPIN_TASK', payload: id })
        },
        []
    )

    const dismissCarriedOver = useCallback(
        (id: string) => {
            dispatch({ type: 'DISMISS_CARRIED', payload: id })
        },
        []
    )

    const setSprint = useCallback(
        (sprint: Omit<Sprint, 'id'>) => {
            const newSprint: Sprint = { ...sprint, id: generateId() }
            dispatch({ type: 'SET_SPRINT', payload: newSprint })
        },
        []
    )

    const updateSprintNotes = useCallback(
        (notes: string) => {
            dispatch({ type: 'UPDATE_SPRINT_NOTES', payload: notes })
        },
        []
    )

    const saveCheckin = useCallback(
        (checkin: Omit<Checkin, 'id'>) => {
            const newCheckin: Checkin = { ...checkin, id: generateId() }
            dispatch({ type: 'SAVE_CHECKIN', payload: newCheckin })
        },
        []
    )

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
        () =>
            sortTasks(
                state.tasks.filter(
                    (t) =>
                        !t.isDone &&
                        !t.carriedOver &&
                        !t.isPinnedToday &&
                        !(t.deadline !== null && isToday(t.deadline))
                )
            ),
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
