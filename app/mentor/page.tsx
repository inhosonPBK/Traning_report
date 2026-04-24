import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InternCardGrid, { InternData } from '@/components/InternCardGrid'
import { InterviewReport, Report } from '@/types'

export default async function MentorPage() {
  const { profile } = await requireProfile(['mentor', 'hr'])
  const admin = createAdminClient()

  const { data: intern } = await admin
    .from('profiles')
    .select('*')
    .eq('mentor_id', profile.id)
    .single()

  const { data: reports } = intern
    ? await admin.from('reports').select('*').eq('intern_id', intern.id).order('week_number')
    : { data: [] }

  const { data: interviewReports } = intern
    ? await admin.from('interview_reports').select('*').eq('intern_id', intern.id).order('interview_date', { ascending: false })
    : { data: [] }

  const internsData: InternData[] = intern
    ? [{
        intern,
        reports: (reports as Report[]) || [],
        interviewReports: (interviewReports as InterviewReport[]) || [],
        mentorName: null,
      }]
    : []

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 1080, margin: '28px auto', padding: '0 24px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Intern Reports</div>
          {intern && (
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
              {intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}
            </div>
          )}
        </div>

        {!intern ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No intern assigned.</div>
        ) : (
          <InternCardGrid
            internsData={internsData}
            groupByTeam={false}
            viewerRole="mentor"
          />
        )}
      </div>
    </>
  )
}
