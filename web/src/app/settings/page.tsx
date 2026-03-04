'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Sidebar } from '@/components/Sidebar'
import { User, Mail, Lock, Bell, Moon, Globe, Shield, LogOut, Camera, Save } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile')
  const [saving, setSaving] = useState(false)

  // Form states
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleSave = async () => {
    setSaving(true)
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie suas preferências e conta</p>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {getInitials(name)}
                          </span>
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <Camera size={16} className="text-gray-600" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                        <p className="text-gray-500">{email}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Moon className="text-gray-500" size={20} />
                            <div>
                              <p className="font-medium text-gray-900">Modo Escuro</p>
                              <p className="text-sm text-gray-500">Usar tema escuro na interface</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-12 h-7 rounded-full transition-colors ${
                              darkMode ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              darkMode ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Globe className="text-gray-500" size={20} />
                            <div>
                              <p className="font-medium text-gray-900">Idioma</p>
                              <p className="text-sm text-gray-500">Português (Brasil)</p>
                            </div>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-700">
                            <option>Português (Brasil)</option>
                            <option>English</option>
                            <option>Español</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-500" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Notificações por E-mail</p>
                          <p className="text-sm text-gray-500">Receber atualizações por e-mail</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`w-12 h-7 rounded-full transition-colors ${
                          emailNotifications ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="text-gray-500" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Notificações Push</p>
                          <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`w-12 h-7 rounded-full transition-colors ${
                          pushNotifications ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="text-gray-500" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Alterar Senha</p>
                          <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Senha atual"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="password"
                          placeholder="Nova senha"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="password"
                          placeholder="Confirmar nova senha"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="pt-6 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={20} />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/30"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
