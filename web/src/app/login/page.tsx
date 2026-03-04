'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Layers, Eye, EyeOff, ArrowRight } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', data)
      setToken(response.data.access_token)
      
      // Buscar dados do usuário
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` }
      })
      setUser(userResponse.data)
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-700 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-primary-600/20 rounded-xl">
              <Layers className="h-8 w-8 text-primary-500" />
            </div>
            <span className="text-2xl font-bold text-white">
              Mini<span className="text-primary-500">Jira</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Gerencie seus projetos<br />
            de forma <span className="text-primary-500">simples</span>
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-md">
            Organize tarefas, colabore com sua equipe e acompanhe o progresso de todos os seus projetos em um só lugar.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {['Kanban boards intuitivos', 'Colaboração em tempo real', 'Relatórios e métricas'].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-primary-600/10 rounded-xl">
              <Layers className="h-7 w-7 text-primary-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Mini<span className="text-primary-600">Jira</span>
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 mb-8">
              Entre com suas credenciais para continuar
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <Link href="#" className="text-sm text-primary-600 hover:text-primary-700">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Entrar na plataforma
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 mt-8">
              Não tem conta?{' '}
              <Link href="/register" className="text-primary-600 font-medium hover:text-primary-700">
                Solicite acesso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
