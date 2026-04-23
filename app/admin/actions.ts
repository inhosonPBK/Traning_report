'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function approveUser(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return { error: 'Not authorized' }

  const targetId = formData.get('userId') as string
  const role = formData.get('role') as string
  const mentorId = formData.get('mentorId') as string || null
  const department = formData.get('department') as string
  const position = (formData.get('position') as string) || null

  const { error } = await admin.from('profiles').update({
    status: 'approved',
    role,
    mentor_id: role === 'intern' ? mentorId : null,
    department,
    position,
  }).eq('id', targetId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/manager')
  return { success: true }
}

export async function resetUserPassword(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return { error: 'Not authorized' }

  const targetId = formData.get('userId') as string
  const newPassword = formData.get('newPassword') as string

  if (!newPassword || newPassword.length < 8) return { error: '비밀번호는 8자 이상이어야 합니다.' }

  const { error } = await admin.auth.admin.updateUserById(targetId, { password: newPassword })
  if (error) return { error: error.message }

  return { success: true }
}

export async function updateUserProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return { error: 'Not authorized' }

  const targetId = formData.get('userId') as string
  const department = (formData.get('department') as string) || null
  const position = (formData.get('position') as string) || null

  const { error } = await admin.from('profiles').update({ department, position }).eq('id', targetId)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/manager')
  revalidatePath('/mentor')
  return { success: true }
}

export async function rejectUser(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return { error: 'Not authorized' }

  const targetId = formData.get('userId') as string

  await admin.from('profiles').delete().eq('id', targetId)
  await admin.auth.admin.deleteUser(targetId)

  revalidatePath('/admin')
  return { success: true }
}
