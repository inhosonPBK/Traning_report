import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InternCardGrid, { InternData } from '@/components/InternCardGrid'
import { InterviewReport, Report } from '@/types'
import Link from 'next/link'

export default async function MentorPage() {
  const { profile } = await requireProfile('mentor')
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

  const hasDraftInterview = (interviewReports as InterviewReport[])?.some(r => r.status === 'draft')

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Intern Reports</div>
            {intern && (
              <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                {intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}
              </div>
            )}
          </div>
          {intern && (
            <Link
              href="/mentor/interview"
              style={{
                background: '#F9FAFB',
                border: '1.5px solid #E8EDF3',
                color: '#1F4E79',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              📋 면담 보고서
              {hasDraftInterview && (
                <span style={{ background: '#C55A11', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>
                  Draft
                </span>
              )}
            </Link>
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
