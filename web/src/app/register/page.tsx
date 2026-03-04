'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Layers, Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Uma letra maiúscula')
    .regex(/[a-z]/, 'Uma letra minúscula')
    .regex(/[0-9]/, 'Um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Um caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Um número', met: /[0-9]/.test(password) },
    { label: 'Um caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao registrar')
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
            Comece sua jornada<br />
            de <span className="text-primary-500">produtividade</span>
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-md">
            Crie sua conta e comece a organizar seus projetos de forma eficiente com nossa plataforma intuitiva.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {['Crie projetos ilimitados', 'Colabore com sua equipe', 'Acompanhe métricas em tempo real'].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-500" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
              Criar Conta
            </h2>
            <p className="text-gray-500 mb-8">
              Preencha os dados para solicitar acesso
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
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
                
                {/* Password Requirements */}
                {password.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {req.met ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <X size={16} className="text-gray-300" />
                        )}
                        <span className={req.met ? 'text-emerald-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                    Criar Conta
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 mt-8">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
