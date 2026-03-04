'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { LayoutDashboard, FolderKanban, LogOut, User, Bell, Settings, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projetos', icon: FolderKanban, badge: null },
    { href: '/notifications', label: 'Notificações', icon: Bell, badge: 3 },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <aside className="w-72 bg-sidebar-dark min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-primary-600/20 rounded-xl">
            <Layers className="h-7 w-7 text-primary-500" />
          </div>
          <span className="text-xl font-bold text-white">
            Mini<span className="text-primary-500">Jira</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  <span className="flex-1">{link.label}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-card">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user?.name ? getInitials(user.name) : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email || 'email@exemplo.com'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full mt-2 text-slate-400 hover:bg-sidebar-hover hover:text-white rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
