import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import ReportForm from '@/components/ReportForm'

export default async function InternPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role !== 'intern') redirect('/mentor')

  return (
    <>
      <NavBar profile={profile} />
      <ReportForm profile={profile} />
    </>
  )
}
