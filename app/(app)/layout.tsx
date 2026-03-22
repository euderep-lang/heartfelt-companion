import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil e empresa do usuário
  const { data: perfil } = await supabase
    .from('perfis')
    .select('*, empresa:empresas(*)')
    .eq('id', user.id)
    .single()

  return (
    <AppShell perfil={perfil} empresa={perfil?.empresa ?? null}>
      {children}
    </AppShell>
  )
}
