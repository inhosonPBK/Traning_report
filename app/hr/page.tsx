import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InternCardGrid, { InternData } from '@/components/InternCardGrid'
import { InterviewReport, Profile, Report } from '@/types'
import Link from 'next/link'

export default async function HRPage() {
  const { profile } = await requireProfile('hr')
  const admin = createAdminClient()

  // HR: 전체 팀 인턴 조회 (팀 필터 없음)
  const { data: interns } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'intern')
    .eq('status', 'approved')
    .order('name')

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
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>All Reports — HR View</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>전사 인턴 레포트 및 면담 보고서 열람 · {internsData.length}명</div>
          </div>
          {profile.is_admin && (
            <Link href="/admin" style={{ fontSize: 13, color: '#1F4E79', fontWeight: 600, textDecoration: 'none' }}>Admin Panel →</Link>
          )}
        </div>

        {!internsData.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>등록된 인턴이 없습니다.</div>
        ) : (
          <InternCardGrid
            internsData={internsData}
            groupByTeam={true}
            viewerRole="hr"
          />
        )}
      </div>
    </>
  )
}
