'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/Sidebar'
import { KanbanBoard } from '@/components/KanbanBoard'
import { CreateTaskModal } from '@/components/CreateTaskModal'
import { Plus, Users, Settings } from 'lucide-react'

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

interface Project {
  id: number
  name: string
  description: string
  owner_id: number
  members: any[]
}

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { isAuthenticated, token } = useAuthStore()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadProject()
    loadTasks()
  }, [isAuthenticated, router, projectId])

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProject(response.data)
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
      router.push('/dashboard')
    }
  }

  const loadTasks = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks?size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(response.data.items)
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = () => {
    setShowCreateTaskModal(false)
    loadTasks()
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(
        `/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      loadTasks()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 mt-1">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users size={20} />
              <span className="hidden sm:inline">Membros ({project.members.length})</span>
            </button>

            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              Nova Tarefa
            </button>
          </div>
        </div>

        <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} onTasksReload={loadTasks} />
      </main>

      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={parseInt(projectId)}
          onClose={() => setShowCreateTaskModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  )
}
