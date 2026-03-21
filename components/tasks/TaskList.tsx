'use client'

import { Task } from '@/lib/types'
import TaskItem from './TaskItem'

interface TaskListProps {
    tasks: Task[]
    emptyTitle?: string
    emptySubtext?: string
    showPinButton?: boolean
    showCarriedActions?: boolean
}

export default function TaskList({
    tasks,
    emptyTitle = 'No tasks yet',
    emptySubtext,
    showPinButton = false,
    showCarriedActions = false,
}: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="text-[14px] text-text2">{emptyTitle}</div>
                {emptySubtext && (
                    <div className="text-[13px] text-text3 mt-1">{emptySubtext}</div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    showPinButton={showPinButton}
                    showCarriedActions={showCarriedActions}
                />
            ))}
        </div>
    )
}
