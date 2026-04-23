import { createAdminClient } from './supabase-admin'
import { createClient } from './supabase-server'
import { redirect } from 'next/navigation'
import { Profile, Role } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as Profile | null
}

// For role-restricted pages — accepts a single role or an array of allowed roles
export async function requireProfile(allowedRole?: Role | Role[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.status === 'pending') redirect('/pending')

  if (allowedRole) {
    const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole]
    if (!profile.role || !allowed.includes(profile.role)) redirect('/dashboard')
  }

  return { user, profile }
}

// For admin panel — any approved user with is_admin=true, regardless of role
export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.status === 'pending') redirect('/pending')
  if (!profile.is_admin) redirect('/dashboard')

  return { user, profile }
}
