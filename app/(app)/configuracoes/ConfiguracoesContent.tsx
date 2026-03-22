'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, User, Palette, CreditCard, Shield,
  Loader2, Save, Upload, X, Check, Eye, EyeOff,
  Star, Zap, HardHat,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Perfil, Empresa } from '@/types'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Schemas ───────────────────────────────────────────────
const empresaSchema = z.object({
  nome: z.string().min(2),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  site: z.string().optional(),
  endereco: z.string().optional(),
  responsavel_nome: z.string().optional(),
  responsavel_cargo: z.string().optional(),
  responsavel_telefone: z.string().optional(),
  responsavel_email: z.string().email().optional().or(z.literal('')),
})

const orcamentoSchema = z.object({
  prefixo_orcamento: z.string().min(1).max(5),
  texto_validade: z.string(),
  texto_introducao: z.string().optional(),
  texto_condicoes_pagamento: z.string().optional(),
  texto_observacoes: z.string().optional(),
})

const perfilSchema = z.object({
  nome: z.string().min(1),
  cargo: z.string().optional(),
})

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Informe a senha atual'),
  novaSenha: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmarSenha: z.string(),
}).refine(d => d.novaSenha === d.confirmarSenha, { message: 'Senhas não conferem', path: ['confirmarSenha'] })

type EmpresaForm = z.infer<typeof empresaSchema>
type OrcamentoForm = z.infer<typeof orcamentoSchema>
type PerfilForm = z.infer<typeof perfilSchema>
type SenhaForm = z.infer<typeof senhaSchema>
type Aba = 'empresa' | 'perfil' | 'identidade' | 'planos' | 'seguranca'

interface Props {
  perfil: Perfil | null
  empresa: Empresa | null
}

// ─── Componente principal ───────────────────────────────────
export function ConfiguracoesContent({ perfil, empresa }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('empresa')

  const abas = [
    { id: 'empresa' as Aba, label: 'Empresa', Icon: Building2 },
    { id: 'perfil' as Aba, label: 'Perfil', Icon: User },
    { id: 'identidade' as Aba, label: 'Identidade Visual', Icon: Palette },
    { id: 'planos' as Aba, label: 'Planos', Icon: CreditCard },
    { id: 'seguranca' as Aba, label: 'Segurança', Icon: Shield },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie os dados da empresa e suas preferências</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar interna */}
        <div className="w-52 shrink-0">
          <nav className="space-y-0.5">
            {abas.map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left',
                  abaAtiva === aba.id
                    ? 'bg-[#fff5f0] text-[#c94208] border border-[#ffc4a0]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <aba.Icon className="w-4 h-4 shrink-0" />
                {aba.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {abaAtiva === 'empresa' && <AbaEmpresa empresa={empresa} />}
              {abaAtiva === 'perfil' && <AbaPerfil perfil={perfil} />}
              {abaAtiva === 'identidade' && <AbaIdentidade empresa={empresa} />}
              {abaAtiva === 'planos' && <AbaPlanos empresa={empresa} />}
              {abaAtiva === 'seguranca' && <AbaSeguranca />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Componentes de campo reutilizáveis ─────────────────────
function Campo({ label, error, required, children }: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, ...rest } = props as { hasError?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
  return (
    <input
      className={cn(
        'w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400',
        'focus:outline-none focus:ring-1 transition-colors',
        hasError ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-[#e8500a]/60 focus:ring-[#e8500a]/20',
        className
      )}
      {...rest}
    />
  )
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={cn(
        'w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400',
        'focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20 resize-none',
        className
      )}
      {...props}
    />
  )
}

function BotaoSalvar({ loading, children = 'Salvar alterações' }: { loading?: boolean; children?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-all disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {children}
    </button>
  )
}

function SecaoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ─── ABA EMPRESA ───────────────────────────────────────────
function AbaEmpresa({ empresa }: { empresa: Empresa | null }) {
  const [salvando, setSalvando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [cep, setCep] = useState('')

  const { register: regEmp, handleSubmit: hsEmp, formState: { errors: errEmp }, setValue: setEmp } = useForm<EmpresaForm>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: empresa?.nome ?? '',
      cnpj: empresa?.cnpj ?? '',
      telefone: empresa?.telefone ?? '',
      email: empresa?.email ?? '',
      site: empresa?.site ?? '',
      endereco: empresa?.endereco ?? '',
      responsavel_nome: empresa?.responsavel_nome ?? '',
      responsavel_cargo: empresa?.responsavel_cargo ?? '',
      responsavel_telefone: empresa?.responsavel_telefone ?? '',
      responsavel_email: empresa?.responsavel_email ?? '',
    },
  })

  const { register: regOrc, handleSubmit: hsOrc, formState: { errors: errOrc } } = useForm<OrcamentoForm>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      prefixo_orcamento: empresa?.prefixo_orcamento ?? 'OBQ',
      texto_validade: empresa?.texto_validade ?? '30 dias',
      texto_introducao: empresa?.texto_introducao ?? '',
      texto_condicoes_pagamento: empresa?.texto_condicoes_pagamento ?? '',
      texto_observacoes: empresa?.texto_observacoes ?? '',
    },
  })

  async function buscarCep() {
    const nums = cep.replace(/\D/g, '')
    if (nums.length !== 8) { toast.error('CEP inválido'); return }
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`)
      const data = await res.json()
      if (data.erro) { toast.error('CEP não encontrado'); return }
      const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
      setEmp('endereco', endereco)
      toast.success('Endereço preenchido!')
    } catch {
      toast.error('Erro ao buscar CEP')
    } finally {
      setBuscandoCep(false)
    }
  }

  async function salvarEmpresa(data: EmpresaForm) {
    setSalvando(true)
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) toast.success('Dados da empresa salvos!')
      else toast.error('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarOrcamento(data: OrcamentoForm) {
    setSalvando(true)
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) toast.success('Configurações de orçamento salvas!')
      else toast.error('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Dados da empresa */}
      <form onSubmit={hsEmp(salvarEmpresa)}>
        <SecaoCard title="Dados da Empresa">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo label="Nome da empresa" required error={errEmp.nome?.message}>
                <Input {...regEmp('nome')} placeholder="Construtora ABC" hasError={!!errEmp.nome} />
              </Campo>
              <Campo label="CNPJ" error={errEmp.cnpj?.message}>
                <Input {...regEmp('cnpj')} placeholder="00.000.000/0001-00" />
              </Campo>
              <Campo label="Telefone">
                <Input {...regEmp('telefone')} placeholder="(11) 99999-9999" />
              </Campo>
              <Campo label="E-mail corporativo">
                <Input {...regEmp('email')} type="email" placeholder="contato@empresa.com" />
              </Campo>
              <Campo label="Site">
                <Input {...regEmp('site')} placeholder="www.empresa.com.br" />
              </Campo>
            </div>

            {/* CEP + Endereço */}
            <div className="flex gap-2">
              <Campo label="CEP">
                <div className="flex gap-2">
                  <Input
                    value={cep}
                    onChange={e => setCep(e.target.value)}
                    onBlur={buscarCep}
                    placeholder="00000-000"
                    className="w-32"
                  />
                  <button
                    type="button"
                    onClick={buscarCep}
                    disabled={buscandoCep}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs transition-colors disabled:opacity-50"
                  >
                    {buscandoCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
                  </button>
                </div>
              </Campo>
            </div>
            <Campo label="Endereço completo">
              <Input {...regEmp('endereco')} placeholder="Rua, número, bairro, cidade - UF" />
            </Campo>

            <hr className="border-slate-200" />

            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsável</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo label="Nome do responsável">
                <Input {...regEmp('responsavel_nome')} placeholder="João da Silva" />
              </Campo>
              <Campo label="Cargo">
                <Input {...regEmp('responsavel_cargo')} placeholder="Engenheiro Civil" />
              </Campo>
              <Campo label="Telefone direto">
                <Input {...regEmp('responsavel_telefone')} placeholder="(11) 99999-9999" />
              </Campo>
              <Campo label="E-mail direto">
                <Input {...regEmp('responsavel_email')} type="email" placeholder="joao@empresa.com" />
              </Campo>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <BotaoSalvar loading={salvando} />
          </div>
        </SecaoCard>
      </form>

      {/* Config de orçamentos */}
      <form onSubmit={hsOrc(salvarOrcamento)}>
        <SecaoCard title="Configurações de Orçamento">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo label="Prefixo dos orçamentos" error={errOrc.prefixo_orcamento?.message}>
                <Input {...regOrc('prefixo_orcamento')} placeholder="OBQ" maxLength={5} />
              </Campo>
              <Campo label="Prazo de validade padrão">
                <select
                  {...regOrc('texto_validade')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 cursor-pointer"
                >
                  {['15 dias', '30 dias', '45 dias', '60 dias', '90 dias'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </Campo>
            </div>
            <Campo label="Texto de introdução padrão">
              <Textarea {...regOrc('texto_introducao')} placeholder="Texto que aparece no início de todos os orçamentos..." />
            </Campo>
            <Campo label="Condições de pagamento padrão">
              <Textarea {...regOrc('texto_condicoes_pagamento')} placeholder="Ex: 30% de entrada, restante na conclusão" />
            </Campo>
            <Campo label="Observações padrão">
              <Textarea {...regOrc('texto_observacoes')} placeholder="Observações que aparecem em todos os orçamentos" />
            </Campo>
          </div>
          <div className="flex justify-end mt-4">
            <BotaoSalvar loading={salvando} />
          </div>
        </SecaoCard>
      </form>
    </div>
  )
}

// ─── ABA PERFIL ────────────────────────────────────────────
function AbaPerfil({ perfil }: { perfil: Perfil | null }) {
  const [salvando, setSalvando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(perfil?.avatar_url ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: perfil?.nome ?? '', cargo: perfil?.cargo ?? '' },
  })

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return }

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'avatares')
    fd.append('campo', 'avatar')

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setAvatarUrl(url)
      toast.success('Avatar atualizado!')
    } else {
      toast.error('Erro ao fazer upload')
    }
    setUploading(false)
  }

  async function onSubmit(data: PerfilForm) {
    setSalvando(true)
    try {
      const res = await fetch('/api/configuracoes?tipo=perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) toast.success('Perfil salvo!')
      else toast.error('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SecaoCard title="Meu Perfil">
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#e8500a] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">{perfil?.nome ?? 'Usuário'}</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-[#e8500a] hover:text-[#c94208] transition-colors"
              >
                <Upload className="w-3 h-3" />
                Alterar foto
              </button>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG — máx. 5MB</p>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Nome completo" required error={errors.nome?.message}>
              <Input {...register('nome')} placeholder="Seu nome" hasError={!!errors.nome} />
            </Campo>
            <Campo label="E-mail">
              <div className="relative">
                <Input value={perfil?.email ?? ''} disabled className="opacity-60 cursor-not-allowed pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" title="Para alterar, contate o suporte">🔒</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Para alterar o e-mail, entre em contato com o suporte.</p>
            </Campo>
            <Campo label="Cargo na empresa">
              <Input {...register('cargo')} placeholder="Engenheiro Civil" />
            </Campo>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <BotaoSalvar loading={salvando}>Salvar perfil</BotaoSalvar>
        </div>
      </SecaoCard>
    </form>
  )
}

// ─── ABA IDENTIDADE VISUAL ─────────────────────────────────
function AbaIdentidade({ empresa }: { empresa: Empresa | null }) {
  const [salvando, setSalvando] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingTimbrado, setUploadingTimbrado] = useState(false)
  const [logoUrl, setLogoUrl] = useState(empresa?.logo_url ?? '')
  const [timbradoUrl, setTimbradoUrl] = useState(empresa?.papel_timbrado_url ?? '')
  const [corPrimaria, setCorPrimaria] = useState(empresa?.cor_primaria ?? '#F59E0B')
  const [corSecundaria, setCorSecundaria] = useState(empresa?.cor_secundaria ?? '#0A0A0F')
  const [arrastando, setArrastando] = useState<'logo' | 'timbrado' | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const timbradoRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File, campo: 'logo' | 'timbrado') {
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return }

    const setter = campo === 'logo' ? setUploadingLogo : setUploadingTimbrado
    setter(true)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', campo === 'logo' ? 'logos' : 'timbrados')
    fd.append('campo', campo)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      if (campo === 'logo') setLogoUrl(url)
      else setTimbradoUrl(url)
      toast.success(`${campo === 'logo' ? 'Logo' : 'Papel timbrado'} atualizado!`)
    } else {
      toast.error('Erro ao fazer upload')
    }
    setter(false)
  }

  async function handleRemover(campo: 'logo' | 'timbrado') {
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket: campo === 'logo' ? 'logos' : 'timbrados', campo }),
    })
    if (res.ok) {
      if (campo === 'logo') setLogoUrl('')
      else setTimbradoUrl('')
      toast.success('Removido com sucesso')
    } else {
      toast.error('Erro ao remover')
    }
  }

  async function salvarCores() {
    setSalvando(true)
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cor_primaria: corPrimaria, cor_secundaria: corSecundaria }),
      })
      if (res.ok) toast.success('Cores salvas!')
      else toast.error('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  function UploadZone({ campo, url, uploading, inputRef: ref, onFile }: {
    campo: 'logo' | 'timbrado'
    url: string
    uploading: boolean
    inputRef: React.RefObject<HTMLInputElement | null>
    onFile: (f: File) => void
  }) {
    const isArrastando = arrastando === campo
    return (
      <div className="space-y-3">
        <div className="flex gap-4">
          {url && (
            <div className={cn('rounded-lg overflow-hidden border border-slate-200 shrink-0', campo === 'timbrado' ? 'w-16 h-24' : 'h-16 w-32')}>
              <img src={url} alt="" className="w-full h-full object-contain bg-white/5" />
            </div>
          )}
          <div
            onDragOver={e => { e.preventDefault(); setArrastando(campo) }}
            onDragLeave={() => setArrastando(null)}
            onDrop={e => { e.preventDefault(); setArrastando(null); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
            onClick={() => ref.current?.click()}
            className={cn(
              'flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all',
              isArrastando ? 'border-[#e8500a] bg-[#fff5f0]' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-[#e8500a] animate-spin mx-auto" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-600">{url ? 'Substituir' : 'Arraste ou clique'}</p>
              </>
            )}
            <input
              ref={ref as React.RefObject<HTMLInputElement>}
              type="file"
              accept={campo === 'timbrado' ? 'image/*,.pdf' : 'image/*'}
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
          </div>
        </div>
        {url && (
          <button
            type="button"
            onClick={() => handleRemover(campo)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Remover {campo === 'logo' ? 'logo' : 'papel timbrado'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SecaoCard title="Logo da Empresa">
        <p className="text-xs text-slate-400 mb-3">Formatos: PNG, JPG, SVG — máx. 2MB — recomendado fundo transparente (PNG)</p>
        <UploadZone campo="logo" url={logoUrl} uploading={uploadingLogo} inputRef={logoRef} onFile={f => handleUpload(f, 'logo')} />
      </SecaoCard>

      <SecaoCard title="Papel Timbrado">
        <p className="text-xs text-slate-400 mb-3">Usado como fundo nos PDFs gerados. Formato A4 (2480×3508px). Aceita PNG, JPG.</p>
        <UploadZone campo="timbrado" url={timbradoUrl} uploading={uploadingTimbrado} inputRef={timbradoRef} onFile={f => handleUpload(f, 'timbrado')} />
      </SecaoCard>

      <SecaoCard title="Cores do Sistema">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-2">Cor primária (botões, badges, destaques)</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={e => setCorPrimaria(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 bg-transparent"
                />
                <span className="text-sm text-slate-900 font-mono">{corPrimaria}</span>
                <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: corPrimaria, color: '#0A0A0F' }}>
                  Preview
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">Cor secundária (fundo cabeçalho PDF)</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={corSecundaria}
                onChange={e => setCorSecundaria(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 bg-transparent"
              />
              <span className="text-sm text-slate-900 font-mono">{corSecundaria}</span>
              <div className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: corSecundaria }}>
                Preview
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={salvarCores}
              disabled={salvando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-all disabled:opacity-60"
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar cores
            </button>
          </div>
        </div>
      </SecaoCard>
    </div>
  )
}

// ─── ABA PLANOS ────────────────────────────────────────────
const PLANOS = [
  {
    id: 'basico',
    nome: 'Básico',
    preco_mensal: 97,
    preco_anual: 68,
    icon: HardHat,
    cor: '#3B82F6',
    recursos: ['50 orçamentos/mês', '1 usuário', 'PDF básico', 'IA limitada', 'Banco de dados'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco_mensal: 197,
    preco_anual: 138,
    icon: Star,
    cor: '#10B981',
    popular: true,
    recursos: ['Ilimitados orçamentos', '5 usuários', 'PDF com timbrado', 'IA completa', 'Importação CSV/Excel', 'Banco de dados'],
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco_mensal: 497,
    preco_anual: 348,
    icon: Zap,
    cor: '#10B981',
    recursos: ['Tudo do Profissional', 'Usuários ilimitados', 'Multi-empresa', 'API + Integrações', 'Suporte prioritário'],
  },
]

function AbaPlanos({ empresa }: { empresa: Empresa | null }) {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  const [solicitando, setSolicitando] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null)
  const planoAtual = empresa?.plano ?? 'trial'

  async function handleSolicitar(planoId: string) {
    setSolicitando(planoId)
    try {
      await fetch('/api/planos/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano_solicitado: planoId, periodo }),
      })
      setPlanoSelecionado(planoId)
      setModalAberto(true)
    } finally {
      setSolicitando(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Plano atual */}
      <SecaoCard title="Seu Plano Atual">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 capitalize">{planoAtual}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {planoAtual === 'trial' ? `Trial expira em ${empresa?.trial_expira_em ? new Date(empresa.trial_expira_em).toLocaleDateString('pt-BR') : '—'}` : `Plano ${empresa?.plano_periodo ?? 'mensal'}`}
            </p>
          </div>
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', planoAtual === 'trial' ? 'bg-[#fff5f0] text-[#e8500a]' : 'bg-[#fff5f0] text-[#e8500a]')}>
            {planoAtual === 'trial' ? '⏰ Trial ativo' : '✓ Ativo'}
          </span>
        </div>
      </SecaoCard>

      {/* Toggle período */}
      <div className="flex items-center justify-center">
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-1">
          {(['mensal', 'anual'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                periodo === p ? 'bg-[#e8500a] text-white' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {p === 'mensal' ? 'Mensal' : 'Anual — 30% off'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards dos planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANOS.map(plano => {
          const ativo = planoAtual === plano.id
          const preco = periodo === 'mensal' ? plano.preco_mensal : plano.preco_anual
          return (
            <div
              key={plano.id}
              className={cn(
                'bg-white border rounded-xl p-5 flex flex-col transition-all',
                ativo ? 'border-[#e8500a]' : 'border-slate-200',
                plano.popular && !ativo && 'border-[#e8500a]/30'
              )}
            >
              {plano.popular && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fff5f0] text-[#e8500a] font-semibold self-start mb-2">
                  ⭐ Mais popular
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${plano.cor}20` }}>
                  <plano.icon className="w-4 h-4" style={{ color: plano.cor }} />
                </div>
                <h3 className="font-bold text-slate-900">{plano.nome}</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">
                R$ {preco}<span className="text-sm text-slate-600 font-normal">/mês</span>
              </p>
              {periodo === 'anual' && (
                <p className="text-xs text-[#e8500a] mb-3">≈ R$ {(preco * 12).toLocaleString('pt-BR')}/ano</p>
              )}
              <ul className="space-y-1.5 flex-1 mb-4 mt-2">
                {plano.recursos.map(r => (
                  <li key={r} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="w-3 h-3 text-[#e8500a] shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
              {ativo ? (
                <div className="py-2 text-center text-sm text-[#e8500a] font-medium">✓ Plano atual</div>
              ) : (
                <button
                  onClick={() => handleSolicitar(plano.id)}
                  disabled={!!solicitando}
                  className="py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {solicitando === plano.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : plano.id === 'enterprise' ? 'Contratar' : planoAtual === 'trial' ? 'Assinar' : 'Mudar plano'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de confirmação */}
      <Dialog open={modalAberto} onOpenChange={v => !v && setModalAberto(false)}>
        <DialogContent showCloseButton={false} className="bg-white border border-slate-200 max-w-sm p-0">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#fff5f0] flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-[#e8500a]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">🚀 Solicitação Recebida!</h2>
            <p className="text-sm text-slate-600 mb-4">
              Em breve entraremos em contato para finalizar sua contratação do plano{' '}
              <span className="text-[#e8500a] font-semibold capitalize">{planoSelecionado}</span>.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-left space-y-1">
              <p className="text-xs text-slate-600">📧 euder.ep@gmail.com</p>
              <p className="text-xs text-slate-600">📱 WhatsApp: (11) 99999-9999</p>
            </div>
            <button
              onClick={() => setModalAberto(false)}
              className="px-6 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── ABA SEGURANÇA ─────────────────────────────────────────
function AbaSeguranca() {
  const [salvando, setSalvando] = useState(false)
  const [mostrarAtual, setMostrarAtual] = useState(false)
  const [mostrarNova, setMostrarNova] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SenhaForm>({
    resolver: zodResolver(senhaSchema),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmarSenha: '' },
  })

  const novaSenha = watch('novaSenha') ?? ''

  // Força da senha
  const forca = (() => {
    let score = 0
    if (novaSenha.length >= 8) score++
    if (/[A-Z]/.test(novaSenha)) score++
    if (/[0-9]/.test(novaSenha)) score++
    if (/[^A-Za-z0-9]/.test(novaSenha)) score++
    return score
  })()

  const forcaLabel = ['', 'Fraca', 'Média', 'Boa', 'Forte'][forca]
  const forcaCor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][forca]

  async function onSubmit(data: SenhaForm) {
    setSalvando(true)
    try {
      const res = await fetch('/api/auth/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha }),
      })
      if (res.ok) {
        toast.success('Senha alterada com sucesso!')
        reset()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Erro ao alterar senha')
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SecaoCard title="Alterar Senha">
        <div className="space-y-4">
          <Campo label="Senha atual" error={errors.senhaAtual?.message}>
            <div className="relative">
              <Input
                {...register('senhaAtual')}
                type={mostrarAtual ? 'text' : 'password'}
                placeholder="••••••••"
                hasError={!!errors.senhaAtual}
                className="pr-10"
              />
              <button type="button" onClick={() => setMostrarAtual(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {mostrarAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Campo>

          <Campo label="Nova senha" error={errors.novaSenha?.message}>
            <div className="relative">
              <Input
                {...register('novaSenha')}
                type={mostrarNova ? 'text' : 'password'}
                placeholder="••••••••"
                hasError={!!errors.novaSenha}
                className="pr-10"
              />
              <button type="button" onClick={() => setMostrarNova(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {mostrarNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {novaSenha.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${forca * 25}%`, backgroundColor: forcaCor }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: forcaCor }}>{forcaLabel}</span>
                </div>
              </div>
            )}
          </Campo>

          <Campo label="Confirmar nova senha" error={errors.confirmarSenha?.message}>
            <Input
              {...register('confirmarSenha')}
              type="password"
              placeholder="••••••••"
              hasError={!!errors.confirmarSenha}
            />
          </Campo>

          {/* Requisitos */}
          <ul className="space-y-1">
            {[
              { ok: novaSenha.length >= 8, label: 'Mínimo 8 caracteres' },
              { ok: /[0-9]/.test(novaSenha), label: 'Pelo menos 1 número' },
              { ok: /[A-Z]/.test(novaSenha), label: 'Pelo menos 1 letra maiúscula' },
            ].map(req => (
              <li key={req.label} className="flex items-center gap-2 text-xs">
                <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center', req.ok ? 'bg-[#ffe8dc]' : 'bg-slate-100')}>
                  <Check className={cn('w-2 h-2', req.ok ? 'text-[#e8500a]' : 'text-slate-400')} />
                </div>
                <span className={req.ok ? 'text-slate-600' : 'text-slate-400'}>{req.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end mt-4">
          <BotaoSalvar loading={salvando}>Alterar senha</BotaoSalvar>
        </div>
      </SecaoCard>
    </form>
  )
}
