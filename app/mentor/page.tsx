import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import StatusBadge from '@/components/StatusBadge'
import { getWeekInfo } from '@/lib/weeks'
import { InterviewReport, Report } from '@/types'
import Link from 'next/link'

export default async function MentorPage() {
  const { profile } = await requireProfile('mentor')
  const admin = createAdminClient()

  const { data: intern } = await admin.from('profiles').select('*').eq('mentor_id', profile.id).single()
  const { data: reports } = intern
    ? await admin.from('reports').select('*').eq('intern_id', intern.id).order('week_number')
    : { data: [] }
  const { data: interviewReports } = intern
    ? await admin.from('interview_reports').select('*').eq('intern_id', intern.id).order('interview_date', { ascending: false })
    : { data: [] }

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Intern Reports</div>
            {intern && <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}</div>}
          </div>
          {intern && (
            <Link
              href="/mentor/interview"
              style={{ background: '#F9FAFB', border: '1.5px solid #E8EDF3', color: '#1F4E79', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              📋 면담 보고서
              {(interviewReports as InterviewReport[])?.some(r => r.status === 'draft') && (
                <span style={{ marginLeft: 6, background: '#C55A11', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>Draft</span>
              )}
            </Link>
          )}
        </div>
        {!intern ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No intern assigned.</div>
        ) : !reports?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No reports submitted yet.</div>
        ) : (
          (reports as Report[]).map(r => (
            <Link key={r.id} href={`/mentor/${r.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', marginBottom: 12, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* 주차 번호 강조 */}
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#EEF2F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: '#999', fontWeight: 700, letterSpacing: .5 }}>WEEK</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1F4E79', lineHeight: 1 }}>{r.week_number}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{r.topic || '(No topic)'}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{getWeekInfo(r.week_number)}{r.rating ? ` · ${r.rating}` : ''}</div>
                    {/* 피드백 여부 표시 */}
                    {r.status === 'completed' && (
                      <div style={{ fontSize: 11, color: '#375623', fontWeight: 700, marginTop: 4 }}>✓ Feedback given</div>
                    )}
                    {r.status === 'submitted' && (
                      <div style={{ fontSize: 11, color: '#C55A11', fontWeight: 700, marginTop: 4 }}>● Needs review</div>
                    )}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
