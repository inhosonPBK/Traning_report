import { createAdminClient } from './supabase-admin'
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
