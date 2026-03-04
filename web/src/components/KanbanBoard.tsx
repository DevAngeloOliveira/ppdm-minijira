'use client'

import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface Task {
  id: number
  title: string
  description: string
  status: 'TODO' | 'DOING' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assigned_to: number | null
  assignee_name: string | null
  project_id: number
  created_at: string
  updated_at: string
}

interface KanbanBoardProps {
  tasks: Task[]
  onStatusChange: (taskId: number, newStatus: string) => void
  onTasksReload: () => void
}

const columns = [
  { id: 'TODO', title: 'A Fazer', color: 'bg-gray-100' },
  { id: 'DOING', title: 'Em Progresso', color: 'bg-blue-50' },
  { id: 'DONE', title: 'Concluído', color: 'bg-green-50' },
]

export function KanbanBoard({ tasks, onStatusChange, onTasksReload }: KanbanBoardProps) {
  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    onStatusChange(taskId, status)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn('flex-1 min-w-[300px] rounded-lg p-4', column.color)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {getTasksByStatus(column.id).length}
            </span>
          </div>

          <div className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                className="cursor-move"
              >
                <TaskCard task={task} onTaskUpdated={onTasksReload} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
