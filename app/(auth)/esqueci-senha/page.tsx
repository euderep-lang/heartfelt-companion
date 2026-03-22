'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowLeft, HardHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nova-senha`,
      })
      if (error) {
        toast.error('Erro ao enviar e-mail')
        return
      }
      setEnviado(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#e8500a] flex items-center justify-center">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">ObraQ</span>
        </div>

        {enviado ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#e8500a]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">E-mail enviado!</h2>
            <p className="text-sm text-slate-500 mb-6">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link href="/login" className="text-sm text-[#e8500a] hover:text-[#c94208]">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Esqueceu a senha?</h2>
            <p className="text-sm text-slate-500 mb-8">
              Digite seu e-mail e enviaremos as instruções para redefinir.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className={cn(
                      'w-full pl-9 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm',
                      'text-slate-900 placeholder:text-slate-400',
                      'focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20'
                    )}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-[#e8500a] hover:bg-[#c94208] text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar instruções
              </button>
            </form>

            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mt-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
