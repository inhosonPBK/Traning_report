import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InternCardGrid, { InternData } from '@/components/InternCardGrid'
import { InterviewReport, Profile, Report } from '@/types'
import Link from 'next/link'

export default async function ManagerPage() {
  const { profile } = await requireProfile('manager')
  const admin = createAdminClient()

  // 매니저는 자신과 동일한 팀(department)의 인턴만 조회
  const internsQuery = admin.from('profiles').select('*').eq('role', 'intern').eq('status', 'approved').order('name')
  if (profile.department) internsQuery.eq('department', profile.department)
  const { data: interns } = await internsQuery

  const { data: mentors } = await admin.from('profiles').select('id, name').eq('role', 'mentor')

  const internIds = (interns || []).map((i: any) => i.id)

  const { data: reports } = internIds.length > 0
    ? await admin.from('reports').select('*').in('intern_id', internIds).order('week_number')
    : { data: [] }

  const { data: interviewReports } = internIds.length > 0
    ? await admin.from('interview_reports').select('*').in('intern_id', internIds).order('interview_date', { ascending: false })
    : { data: [] }

  const mentorMap = Object.fromEntries((mentors || []).map((m: any) => [m.id, m.name]))

  const internsData: InternData[] = (interns as Profile[] || []).map(intern => ({
    intern,
    reports: (reports || []).filter((r: Report) => r.intern_id === intern.id),
    interviewReports: (interviewReports || []).filter((r: InterviewReport) => r.intern_id === intern.id),
    mentorName: intern.mentor_id ? mentorMap[intern.mentor_id] ?? null : null,
  }))

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 1080, margin: '28px auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Team Reports — Manager View</div>
            {profile.department && <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{profile.department} Team · {internsData.length} {internsData.length === 1 ? 'intern' : 'interns'}</div>}
          </div>
          {profile.is_admin && (
            <Link href="/admin" style={{ fontSize: 13, color: '#1F4E79', fontWeight: 600, textDecoration: 'none' }}>Admin Panel →</Link>
          )}
        </div>

        {!profile.department ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>⚠️</div>
            <div>Team (Department) is not configured.</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Please configure your team in the Admin Panel.</div>
          </div>
        ) : !internsData.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No interns registered yet.</div>
        ) : (
          <InternCardGrid
            internsData={internsData}
            groupByTeam={false}
            viewerRole="manager"
          />
        )}
      </div>
    </>
  )
}
