import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const BUCKETS_PUBLICOS = ['logos', 'timbrados', 'avatares']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null
  const campo = formData.get('campo') as string | null // 'logo', 'timbrado', 'avatar'

  if (!file || !bucket || !campo) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  if (!BUCKETS_PUBLICOS.includes(bucket)) {
    return NextResponse.json({ error: 'Bucket inválido' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx. 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const folder = campo === 'avatar' ? user.id : perfil.empresa_id
  const path = `${folder}/${campo}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Remove arquivo anterior se existir
  await serviceClient.storage.from(bucket).remove([path])

  const { error: uploadError } = await serviceClient.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = serviceClient.storage.from(bucket).getPublicUrl(path)

  // Salvar URL no banco
  const coluna = campo === 'logo' ? 'logo_url'
    : campo === 'timbrado' ? 'papel_timbrado_url'
    : 'avatar_url'

  if (campo === 'avatar') {
    await supabase.from('perfis').update({ avatar_url: publicUrl }).eq('id', user.id)
  } else {
    await supabase.from('empresas').update({ [coluna]: publicUrl }).eq('id', perfil.empresa_id)
  }

  return NextResponse.json({ url: publicUrl })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const { bucket, campo } = await request.json()

  const coluna = campo === 'logo' ? 'logo_url' : 'papel_timbrado_url'
  const folder = perfil.empresa_id

  // Remover do storage (tenta todas as extensões comuns)
  for (const ext of ['png', 'jpg', 'jpeg', 'svg', 'webp', 'pdf']) {
    await serviceClient.storage.from(bucket).remove([`${folder}/${campo}.${ext}`])
  }

  await supabase.from('empresas').update({ [coluna]: null }).eq('id', perfil.empresa_id)

  return NextResponse.json({ success: true })
}
