import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/get-profile'

export default async function DashboardPage() {
  const { profile } = await requireProfile()
  if (profile.role === 'hr') redirect('/hr')
  if (profile.role === 'manager') redirect('/manager')
  if (profile.role === 'mentor') redirect('/mentor')
  redirect('/intern')
}
