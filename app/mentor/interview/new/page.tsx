import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InterviewReportForm from '@/components/InterviewReportForm'
import { redirect } from 'next/navigation'

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: { internId?: string }
}) {
  const { profile } = await requireProfile('mentor')
  const internId = searchParams.internId

  if (!internId) redirect('/mentor/interview')

  const admin = createAdminClient()
  const { data: intern } = await admin
    .from('profiles')
    .select('*')
    .eq('id', internId)
    .eq('mentor_id', profile.id)
    .single()

  if (!intern) redirect('/mentor/interview')

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 800, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>새 면담 보고서</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
            {intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}
          </div>
        </div>
        <div className="card">
          <InterviewReportForm intern={intern} initialReport={null} />
        </div>
      </div>
    </>
  )
}
