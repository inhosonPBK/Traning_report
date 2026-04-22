import { requireProfile } from '@/lib/get-profile'
import NavBar from '@/components/NavBar'
import ReportForm from '@/components/ReportForm'

export default async function InternPage() {
  const { profile } = await requireProfile('intern')
  return (
    <>
      <NavBar profile={profile} />
      <ReportForm profile={profile} />
    </>
  )
}
