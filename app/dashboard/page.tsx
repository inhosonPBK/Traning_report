import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status === 'pending') redirect('/pending')

  if (profile.role === 'manager') redirect('/manager')
  if (profile.role === 'mentor') redirect('/mentor')
  redirect('/intern')
}
