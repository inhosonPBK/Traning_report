import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/get-profile'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)

  if (!profile || profile.status === 'pending') redirect('/pending')
  if (profile.role === 'manager') redirect('/manager')
  if (profile.role === 'mentor') redirect('/mentor')
  redirect('/intern')
}
