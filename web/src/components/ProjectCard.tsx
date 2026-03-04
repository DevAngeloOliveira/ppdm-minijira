'use client'

import Link from 'next/link'
import { FolderKanban, Users, MoreVertical } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string
  owner_id: number
  created_at: string
  members: any[]
  tasks?: any[]
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const tasks = project.tasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-emerald-500'
    if (progress >= 50) return 'bg-amber-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-primary-500'
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  }

  // Generate random colors for member avatars
  const avatarColors = [
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-emerald-700',
    'from-purple-500 to-purple-700',
    'from-amber-500 to-amber-700',
    'from-rose-500 to-rose-700',
  ]

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="p-6 transition-all bg-white border border-gray-100 cursor-pointer rounded-2xl hover:shadow-lg hover:border-gray-200 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
              <FolderKanban className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                {project.name}
              </h3>
              <p className="text-xs text-gray-500">
                {totalTasks} tarefas
              </p>
            </div>
          </div>
          <button 
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mb-4 text-sm text-gray-500 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-500">Progresso</span>
            <span className="font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-gray-100 rounded-full">
            <div 
              className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Members */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((member, index) => (
                <div 
                  key={member.id || index}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center border-2 border-white`}
                  title={member.user?.name || 'Membro'}
                >
                  <span className="text-xs font-medium text-white">
                    {getInitials(member.user?.name || '')}
                  </span>
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 border-2 border-white rounded-full">
                  <span className="text-xs font-medium text-gray-600">
                    +{project.members.length - 4}
                  </span>
                </div>
              )}
            </div>
            {project.members.length === 0 && (
              <span className="text-xs text-gray-400">Sem membros</span>
            )}
          </div>

          {/* Task count */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="font-medium text-emerald-600">{completedTasks}</span>
            <span>/</span>
            <span>{totalTasks}</span>
            <span className="ml-1">concluídas</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
