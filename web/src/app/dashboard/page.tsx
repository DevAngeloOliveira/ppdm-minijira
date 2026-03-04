'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/Sidebar'
import { ProjectCard } from '@/components/ProjectCard'
import { CreateProjectModal } from '@/components/CreateProjectModal'
import { Plus, Search, Bell, FolderKanban, Clock, CheckCircle2, ListTodo } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string
  owner_id: number
  created_at: string
  members: any[]
  tasks?: any[]
}

interface Stats {
  totalProjects: number
  inProgress: number
  completed: number
  totalTasks: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, token, user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, inProgress: 0, completed: 0, totalTasks: 0 })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadProjects()
  }, [isAuthenticated, router])

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const projectsData = response.data.items || []
      
      // Buscar tasks de cada projeto em paralelo
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project: any) => {
          try {
            const tasksResponse = await api.get(`/projects/${project.id}/tasks?size=100`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            return { ...project, tasks: tasksResponse.data.items || [] }
          } catch {
            return { ...project, tasks: [] }
          }
        })
      )
      
      setProjects(projectsWithTasks)
      
      // Calculate stats
      let totalTasks = 0
      let completedTasks = 0
      
      projectsWithTasks.forEach((p: any) => {
        if (p.tasks) {
          totalTasks += p.tasks.length
          completedTasks += p.tasks.filter((t: any) => t.status === 'DONE').length
        }
      })
      
      setStats({
        totalProjects: projectsWithTasks.length,
        inProgress: projectsWithTasks.filter((p: any) => p.tasks && p.tasks.some((t: any) => t.status === 'DOING')).length,
        completed: projectsWithTasks.filter((p: any) => p.tasks && p.tasks.length > 0 && p.tasks.every((t: any) => t.status === 'DONE')).length,
        totalTasks: totalTasks,
      })
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = () => {
    setShowCreateModal(false)
    loadProjects()
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Projetos', value: stats.totalProjects, icon: FolderKanban, color: 'bg-blue-500' },
    { label: 'Em Progresso', value: stats.inProgress, icon: Clock, color: 'bg-amber-500' },
    { label: 'Concluídos', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Total Tarefas', value: stats.totalTasks, icon: ListTodo, color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar projetos, tarefas..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {getInitials(user?.name || '')}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${stat.color} bg-opacity-10 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Projects Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Meus Projetos</h2>
              <p className="text-sm text-gray-500 mt-1">Gerencie seus projetos e tarefas</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
            >
              <Plus size={20} />
              Novo Projeto
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto ainda</h3>
              <p className="text-gray-500 mb-6">Crie seu primeiro projeto para começar a organizar suas tarefas</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Criar primeiro projeto →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  )
}
