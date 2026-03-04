'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/Sidebar'
import { ProjectCard } from '@/components/ProjectCard'
import { CreateProjectModal } from '@/components/CreateProjectModal'
import { Plus, Search, FolderKanban, Filter } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string
  owner_id: number
  created_at: string
  members: any[]
  tasks?: any[]
}

export default function ProjectsPage() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProjects()
  }, [isAuthenticated, router])

  useEffect(() => {
    let result = projects

    // Apply search filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filter === 'active') {
      result = result.filter(p => 
        !p.tasks || p.tasks.length === 0 || p.tasks.some((t: any) => t.status !== 'DONE')
      )
    } else if (filter === 'completed') {
      result = result.filter(p => 
        p.tasks && p.tasks.length > 0 && p.tasks.every((t: any) => t.status === 'DONE')
      )
    }

    setFilteredProjects(result)
  }, [projects, searchQuery, filter])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">Carregando projetos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
              <p className="text-gray-500 mt-1">Gerencie todos os seus projetos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
            >
              <Plus size={20} />
              Novo Projeto
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Concluídos'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filter !== 'all' 
                  ? 'Nenhum projeto encontrado' 
                  : 'Nenhum projeto ainda'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filter !== 'all'
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Crie seu primeiro projeto para começar'}
              </p>
              {!searchQuery && filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  Criar primeiro projeto →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
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
