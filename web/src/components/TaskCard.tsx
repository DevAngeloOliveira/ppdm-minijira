'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { User, Clock, History } from 'lucide-react'

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

interface TaskCardProps {
  task: Task
  onTaskUpdated: () => void
}

const priorityStyles = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
}

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
  const { token } = useAuthStore()
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const loadHistory = async () => {
    if (history.length > 0) {
      setShowHistory(!showHistory)
      return
    }

    setLoadingHistory(true)
    try {
      const response = await api.get(`/tasks/${task.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHistory(response.data)
      setShowHistory(true)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full font-medium',
            priorityStyles[task.priority]
          )}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {task.assignee_name && (
            <div className="flex items-center gap-1 text-gray-500">
              <User size={14} />
              <span>{task.assignee_name}</span>
            </div>
          )}
        </div>

        <button
          onClick={loadHistory}
          disabled={loadingHistory}
          className="flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors"
        >
          <History size={14} />
          <span className="text-xs">Histórico</span>
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-2">Histórico de Alterações</p>
          <div className="space-y-2">
            {history.slice(0, 5).map((entry: any) => (
              <div key={entry.id} className="text-xs text-gray-500">
                <span className="font-medium">{entry.changed_by_name}</span>
                {' alterou '}
                <span className="font-medium">
                  {entry.action_type === 'STATUS_CHANGE' ? 'status' : 'responsável'}
                </span>
                {' de '}
                <span className="text-gray-700">{entry.old_value || 'vazio'}</span>
                {' para '}
                <span className="text-gray-700">{entry.new_value || 'vazio'}</span>
                <div className="text-gray-400">
                  {new Date(entry.changed_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
