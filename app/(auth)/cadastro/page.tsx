'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HardHat, Mail, Lock, User, Building2, Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const cadastroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  nomeEmpresa: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmarSenha: z.string(),
  termos: z.literal(true, { error: 'Aceite os termos para continuar' }),
}).refine(d => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

type CadastroForm = z.infer<typeof cadastroSchema>

function getForcaSenha(senha: string): { nivel: number; label: string; color: string } {
  if (senha.length === 0) return { nivel: 0, label: '', color: '' }
  let score = 0
  if (senha.length >= 8) score++
  if (/[A-Z]/.test(senha)) score++
  if (/[0-9]/.test(senha)) score++
  if (/[^A-Za-z0-9]/.test(senha)) score++

  if (score <= 1) return { nivel: 1, label: 'Fraca', color: '#EF4444' }
  if (score === 2) return { nivel: 2, label: 'Média', color: '#F59E0B' }
  return { nivel: 3, label: 'Forte', color: '#e8500a' }
}

export default function CadastroPage() {
  const router = useRouter()
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [senhaValue, setSenhaValue] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
  })

  const forca = getForcaSenha(senhaValue)

  async function onSubmit(data: CadastroForm) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            nome_empresa: data.nomeEmpresa,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado')
        } else {
          toast.error('Erro ao criar conta: ' + error.message)
        }
        return
      }

      toast.success('Conta criada! Verificando...')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) => cn(
    'w-full pl-9 pr-4 py-2.5 rounded-lg border bg-white text-sm',
    'text-slate-900 placeholder:text-slate-400',
    'focus:outline-none focus:ring-1 transition-colors',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
      : 'border-slate-200 focus:border-[#e8500a]/60 focus:ring-[#e8500a]/20'
  )

  return (
    <div className="flex w-full">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-[#1a2b3c] flex-col items-center justify-center p-12">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">ObraQ</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Comece a usar<br />
            <span className="text-white/80">gratuitamente</span>
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            14 dias de trial gratuito. Sem cartão de crédito. Cancele quando quiser.
          </p>

          <div className="space-y-3">
            {[
              '14 dias de trial grátis',
              'Configuração em 5 minutos',
              'Suporte por e-mail incluído',
              'Sem compromisso',
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm py-8"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#e8500a] flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ObraQ</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Criar sua conta</h2>
          <p className="text-sm text-slate-500 mb-6">Grátis por 14 dias, sem cartão</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('nome')} type="text" placeholder="Seu nome" className={inputClass(!!errors.nome)} />
              </div>
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
            </div>

            {/* Empresa */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Nome da empresa</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('nomeEmpresa')} type="text" placeholder="Sua construtora" className={inputClass(!!errors.nomeEmpresa)} />
              </div>
              {errors.nomeEmpresa && <p className="text-xs text-red-500 mt-1">{errors.nomeEmpresa.message}</p>}
            </div>

            {/* E-mail */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">E-mail profissional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('email')} type="email" placeholder="seu@email.com" className={inputClass(!!errors.email)} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Senha */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('senha')}
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mín. 8 caracteres"
                  onChange={e => setSenhaValue(e.target.value)}
                  className={inputClass(!!errors.senha)}
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {senhaValue && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(n => (
                      <div
                        key={n}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{ backgroundColor: n <= forca.nivel ? forca.color : '#E2E8F0' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: forca.color }}>{forca.label}</span>
                </div>
              )}
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>}
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('confirmarSenha')} type={showSenha ? 'text' : 'password'} placeholder="Repita a senha" className={inputClass(!!errors.confirmarSenha)} />
              </div>
              {errors.confirmarSenha && <p className="text-xs text-red-500 mt-1">{errors.confirmarSenha.message}</p>}
            </div>

            {/* Termos */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('termos')}
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border border-slate-300 accent-[#e8500a]"
              />
              <span className="text-xs text-slate-500">
                Aceito os{' '}
                <Link href="#" className="text-[#e8500a] hover:underline">Termos de Uso</Link>{' '}
                e a{' '}
                <Link href="#" className="text-[#e8500a] hover:underline">Política de Privacidade</Link>
              </span>
            </label>
            {errors.termos && <p className="text-xs text-red-500 -mt-2">{errors.termos.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-lg font-semibold text-sm transition-all mt-2',
                'bg-[#e8500a] hover:bg-[#c94208] text-white',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar conta grátis
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#e8500a] hover:text-[#c94208] font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
