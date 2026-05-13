import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InterviewReportForm from '@/components/InterviewReportForm'
import { redirect } from 'next/navigation'
import { getWeekInfo } from '@/lib/weeks'

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: { internId?: string; week?: string }
}) {
  const { profile } = await requireProfile(['mentor', 'hr'])
  const internId = searchParams.internId
  const weekNumber = searchParams.week ? parseInt(searchParams.week, 10) : undefined

  if (!internId) redirect('/mentor/interview')

  const admin = createAdminClient()
  const { data: intern } = await admin
    .from('profiles')
    .select('*')
    .eq('id', internId)
    .eq('mentor_id', profile.id)
    .single()

  if (!intern) redirect('/mentor/interview')

  // 해당 주에 이미 보고서가 있으면 편집 페이지로 이동
  if (weekNumber) {
    const { data: existing } = await admin
      .from('interview_reports')
      .select('id')
      .eq('intern_id', internId)
      .eq('week_number', weekNumber)
      .single()

    if (existing) redirect(`/mentor/interview/${existing.id}`)
  }

  const weekLabel = weekNumber ? `Week ${weekNumber} — ${getWeekInfo(weekNumber)}` : 'New Interview'

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 800, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>면담보고서 작성</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
            {intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}
            {weekNumber && (
              <span style={{ marginLeft: 8, color: '#1F4E79', fontWeight: 600 }}>{weekLabel}</span>
            )}
          </div>
        </div>
        <div className="card">
          <InterviewReportForm intern={intern} initialReport={null} weekNumber={weekNumber} />
        </div>
      </div>
    </>
  )
}
