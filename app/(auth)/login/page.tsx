'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HardHat, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha,
      })

      if (error) {
        toast.error('E-mail ou senha incorretos')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full">
      {/* Painel esquerdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a2b3c] flex-col items-center justify-center p-12">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">ObraQ</h1>
          <p className="text-white/70 max-w-xs leading-relaxed">
            Orçamentos de construção civil com Inteligência Artificial. Profissional, rápido e preciso.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              'Orçamentos em minutos com IA',
              'PDF profissional com papel timbrado',
              '3 relatórios automáticos',
              'Envio direto por WhatsApp',
            ].map(feat => (
              <p key={feat} className="text-sm text-white/80 flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-xs font-bold text-white">✓</span>
                {feat}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#e8500a] flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ObraQ</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-slate-500 mb-8">Entre na sua conta para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={cn(
                    'w-full pl-9 pr-4 py-3 rounded-lg border bg-white text-sm',
                    'text-slate-900 placeholder:text-slate-400',
                    'focus:outline-none focus:ring-1 transition-colors',
                    errors.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:border-[#e8500a]/60 focus:ring-[#e8500a]/20'
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Senha</label>
                <Link href="/esqueci-senha" className="text-xs text-[#e8500a] hover:text-[#c94208] transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('senha')}
                  type={showSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'w-full pl-9 pr-10 py-3 rounded-lg border bg-white text-sm',
                    'text-slate-900 placeholder:text-slate-400',
                    'focus:outline-none focus:ring-1 transition-colors',
                    errors.senha
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:border-[#e8500a]/60 focus:ring-[#e8500a]/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>}
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-lg font-semibold text-sm transition-all',
                'bg-[#e8500a] hover:bg-[#c94208] text-white',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Entrar
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-[#e8500a] hover:text-[#c94208] font-medium transition-colors">
              Cadastre-se grátis
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
