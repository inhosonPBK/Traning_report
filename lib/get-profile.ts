import { createAdminClient } from './supabase-admin'
import { createClient } from './supabase-server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as Profile | null
}

// Get current user + profile, redirect if not authenticated or pending
export async function requireProfile(allowedRole?: 'intern' | 'mentor' | 'manager') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.status === 'pending') redirect('/pending')
  if (allowedRole && profile.role !== allowedRole) redirect('/dashboard')

  return { user, profile }
}
