'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Sidebar } from '@/components/Sidebar'
import { Bell, Check, Trash2, FolderKanban, UserPlus, MessageSquare, CheckCircle2 } from 'lucide-react'

interface Notification {
  id: number
  type: 'task' | 'project' | 'member' | 'comment'
  title: string
  description: string
  time: string
  read: boolean
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'task',
      title: 'Nova tarefa atribuída',
      description: 'Você foi atribuído à tarefa "Implementar autenticação"',
      time: 'Há 5 minutos',
      read: false,
    },
    {
      id: 2,
      type: 'project',
      title: 'Projeto criado',
      description: 'O projeto "E-commerce App" foi criado com sucesso',
      time: 'Há 1 hora',
      read: false,
    },
    {
      id: 3,
      type: 'member',
      title: 'Novo membro no projeto',
      description: 'Maria Silva entrou no projeto "Sistema de Gestão"',
      time: 'Há 2 horas',
      read: false,
    },
    {
      id: 4,
      type: 'comment',
      title: 'Novo comentário',
      description: 'João comentou na tarefa "Corrigir bug de login"',
      time: 'Há 3 horas',
      read: true,
    },
    {
      id: 5,
      type: 'task',
      title: 'Tarefa concluída',
      description: 'A tarefa "Criar componente de dashboard" foi marcada como concluída',
      time: 'Ontem',
      read: true,
    },
  ])

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task': return CheckCircle2
      case 'project': return FolderKanban
      case 'member': return UserPlus
      case 'comment': return MessageSquare
      default: return Bell
    }
  }

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'task': return 'bg-emerald-100 text-emerald-600'
      case 'project': return 'bg-blue-100 text-blue-600'
      case 'member': return 'bg-purple-100 text-purple-600'
      case 'comment': return 'bg-amber-100 text-amber-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
              <p className="text-gray-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              >
                <Check size={18} />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-gray-500">
                  Você está em dia! Não há novas notificações no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                        notification.read ? 'border-gray-100' : 'border-primary-200 bg-primary-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${getIconColor(notification.type)}`}>
                          <Icon size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {notification.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Marcar como lida"
                                >
                                  <Check size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Excluir notificação"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
