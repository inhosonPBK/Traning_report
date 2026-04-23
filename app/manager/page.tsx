import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import StatusBadge from '@/components/StatusBadge'
import { getWeekInfo } from '@/lib/weeks'
import { InterviewReport, Profile, Report } from '@/types'
import Link from 'next/link'

export default async function ManagerPage() {
  const { profile } = await requireProfile('manager')
  const admin = createAdminClient()

  const { data: interns } = await admin.from('profiles').select('*').eq('role', 'intern').eq('status', 'approved').order('department')
  const { data: mentors } = await admin.from('profiles').select('id, name').eq('role', 'mentor')
  const internIds = (interns || []).map((i: any) => i.id)
  const { data: reports } = internIds.length > 0
    ? await admin.from('reports').select('*').in('intern_id', internIds).order('week_number')
    : { data: [] }
  const { data: interviewReports } = internIds.length > 0
    ? await admin.from('interview_reports').select('*').in('intern_id', internIds).eq('status', 'submitted').order('interview_date', { ascending: false })
    : { data: [] }
  const mentorMap = Object.fromEntries((mentors || []).map((m: any) => [m.id, m.name]))

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 960, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>All Reports — Manager View</div>
          {profile.is_admin && (
            <Link href="/admin" style={{ fontSize: 13, color: '#1F4E79', fontWeight: 600, textDecoration: 'none' }}>Admin Panel →</Link>
          )}
        </div>
        {!interns?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No interns registered yet.</div>
        ) : (
          (interns as Profile[]).map(intern => {
            const internReports = (reports || []).filter((r: Report) => r.intern_id === intern.id)
            const internInterviews = (interviewReports || []).filter((r: InterviewReport) => r.intern_id === intern.id)
            const mentor = intern.mentor_id ? mentorMap[intern.mentor_id] : null
            return (
              <div key={intern.id} className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{intern.name}</div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>
                      {intern.department}{intern.position ? ` · ${intern.position}` : ''}{mentor ? ` · Mentor: ${mentor}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>{internReports.length} report{internReports.length !== 1 ? 's' : ''}</div>
                </div>

                {/* 주간 레포트 */}
                {!internReports.length ? (
                  <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>No reports yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {internReports.map((r: Report) => (
                      <Link
                        key={r.id}
                        href={r.status === 'completed' ? `/report/${r.id}/print` : r.status === 'draft' ? '#' : `/manager/report/${r.id}`}
                        target={r.status === 'completed' ? '_blank' : undefined}
                        style={{ textDecoration: 'none', pointerEvents: r.status === 'draft' ? 'none' : 'auto' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E8EDF3', borderRadius: 8, padding: '12px 16px', opacity: r.status === 'draft' ? 0.5 : 1, cursor: r.status === 'draft' ? 'default' : 'pointer' }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1F4E79' }}>Week {r.week_number}</span>
                            <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{getWeekInfo(r.week_number)}</span>
                            {r.topic && <span style={{ fontSize: 13, color: '#444', marginLeft: 10 }}>· {r.topic}</span>}
                            {r.status === 'submitted' && (
                              <span style={{ marginLeft: 10, fontSize: 11, color: '#3730A3', fontWeight: 600 }}>⏳ 멘토 피드백 대기 중</span>
                            )}
                            {r.status === 'draft' && (
                              <span style={{ marginLeft: 10, fontSize: 11, color: '#aaa', fontWeight: 600 }}>인턴 작성 중</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {r.rating && <span style={{ fontSize: 12, color: '#777' }}>{r.rating}</span>}
                            <StatusBadge status={r.status} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 면담 보고서 */}
                {internInterviews.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E8EDF3' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#595959', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      📋 면담 보고서
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(internInterviews as InterviewReport[]).map(r => (
                        <Link key={r.id} href={`/manager/interview/${r.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#595959' }}>
                                {r.interview_date ? new Date(r.interview_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '날짜 미입력'}
                              </span>
                              {r.content && (
                                <div style={{ fontSize: 12, color: '#888', marginTop: 1, maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {r.content}
                                </div>
                              )}
                            </div>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#E2EFDA', color: '#375623', border: '1px solid #A9D18E' }}>
                              ✓ 제출 완료
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
