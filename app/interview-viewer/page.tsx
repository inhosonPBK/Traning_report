import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InterviewViewerAccordion, { InternSection } from '@/components/InterviewViewerAccordion'
import { InterviewReport, Profile } from '@/types'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function InterviewViewerPage() {
  const { profile } = await requireProfile(['intern', 'hr', 'mentor', 'manager', 'gm'])

  // is_hr_viewer 또는 hr/mentor/manager/gm 역할만 접근 허용
  if (!profile.is_hr_viewer && !['hr', 'mentor', 'manager', 'gm'].includes(profile.role ?? '')) {
    redirect('/intern')
  }

  const admin = createAdminClient()

  const { data: interns } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'intern')
    .eq('status', 'approved')
    .order('name')

  const { data: mentors } = await admin
    .from('profiles')
    .select('id, name')
    .in('role', ['mentor', 'hr'])

  const internIds = (interns as Profile[] || []).map(i => i.id)

  const { data: rawReports } = internIds.length > 0
    ? await admin
        .from('interview_reports')
        .select('*')
        .in('intern_id', internIds)
        .eq('status', 'submitted')
        .order('intern_id')
        .order('week_number', { ascending: true })
    : { data: [] }

  const reports = (rawReports || []) as InterviewReport[]
  const mentorMap = Object.fromEntries(
    (mentors as Pick<Profile, 'id' | 'name'>[] || []).map(m => [m.id, m.name])
  )

  const sections: InternSection[] = (interns as Profile[] || []).map(intern => ({
    intern,
    reports: reports.filter(r => r.intern_id === intern.id),
    mentorName: intern.mentor_id ? mentorMap[intern.mentor_id] ?? null : null,
  }))

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 900, margin: '28px auto', padding: '0 24px 80px' }}>

        <div style={{ marginBottom: 28 }}>
          <Link href="/intern" style={{ fontSize: 13, color: '#888', fontWeight: 600, textDecoration: 'none' }}>
            ← Back
          </Link>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1F4E79', marginTop: 10 }}>면담보고서 열람</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 3 }}>
            멘토가 제출한 면담보고서 전체 목록 (읽기 전용) · {sections.length}명
          </div>
        </div>

        {!sections.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>등록된 인턴이 없습니다.</div>
        ) : (
          <InterviewViewerAccordion sections={sections} />
        )}
      </div>
    </>
  )
}
