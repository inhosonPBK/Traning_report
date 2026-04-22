import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/get-profile'
import NavBar from '@/components/NavBar'
import ReportForm from '@/components/ReportForm'

export default async function InternPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/login')
  if (profile.role !== 'intern') redirect('/dashboard')

  return (
    <>
      <NavBar profile={profile} />
      <ReportForm profile={profile} />
    </>
  )
}
