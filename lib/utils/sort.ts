import { Task } from '@/lib/types'
import { isOverdue, isToday, toDateString } from './dates'

/**
 * Urgency sort priority — lower number = higher priority.
 *
 * 0: urgent + overdue       — most critical
 * 1: urgent + due today     — must handle today
 * 2: urgent + upcoming      — urgent but has time
 * 3: normal + overdue       — missed deadline
 * 4: normal + due today     — today's work
 * 5: normal + upcoming      — planned ahead
 * 6: normal + no deadline   — open-ended
 * 7: someday                — lowest priority
 */
export function getSortPriority(task: Task): number {
    if (task.urgency === 'someday') return 7

    const deadline = task.deadline
    const overdue = deadline !== null && isOverdue(deadline)
    const dueToday = deadline !== null && isToday(deadline)

    if (task.urgency === 'urgent') {
        if (overdue) return 0
        if (dueToday) return 1
        return 2
    }

    // normal urgency
    if (overdue) return 3
    if (dueToday) return 4
    if (deadline !== null) return 5
    return 6
}

export function sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
        const priorityDiff = getSortPriority(a) - getSortPriority(b)
        if (priorityDiff !== 0) return priorityDiff

        // Same priority: sort by deadline (earlier first), nulls last
        if (a.deadline && b.deadline) {
            const deadlineDiff = a.deadline.localeCompare(b.deadline)
            if (deadlineDiff !== 0) return deadlineDiff
        }
        if (a.deadline && !b.deadline) return -1
        if (!a.deadline && b.deadline) return 1

        // Same deadline: sort by creation date (oldest first)
        return a.createdAt.localeCompare(b.createdAt)
    })
}

export type SortMode = 'date-added' | 'deadline' | 'status' | 'bucket'

export function sortTasksByMode(tasks: Task[], mode: SortMode): Task[] {
    const sorted = [...tasks]
    switch (mode) {
        case 'date-added':
            return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        case 'deadline':
            return sorted.sort((a, b) => {
                if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
                if (a.deadline && !b.deadline) return -1
                if (!a.deadline && b.deadline) return 1
                return a.createdAt.localeCompare(b.createdAt)
            })
        case 'status':
            return sorted.sort((a, b) => {
                if (a.isDone !== b.isDone) return a.isDone ? 1 : -1
                return getSortPriority(a) - getSortPriority(b)
            })
        case 'bucket': {
            const bucketOrder = { work: 0, learn: 1, life: 2 }
            return sorted.sort((a, b) => {
                const bucketDiff = bucketOrder[a.bucket] - bucketOrder[b.bucket]
                if (bucketDiff !== 0) return bucketDiff
                return getSortPriority(a) - getSortPriority(b)
            })
        }
        default:
            return sortTasks(sorted)
    }
}
