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

  const { error } = await admin.from('profiles').update({
    status: 'approved',
    role,
    mentor_id: role === 'intern' ? mentorId : null,
    department,
  }).eq('id', targetId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
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
