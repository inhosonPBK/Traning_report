import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import { InterviewReport, Profile } from '@/types'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function InterviewViewerPage() {
  const { profile } = await requireProfile(['intern', 'hr', 'mentor', 'manager'])

  // is_hr_viewer 또는 hr/mentor/manager 역할만 접근 허용
  if (!profile.is_hr_viewer && !['hr', 'mentor', 'manager'].includes(profile.role ?? '')) {
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

  const fmtDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
  }

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
            멘토가 제출한 면담보고서 전체 목록 (읽기 전용)
          </div>
        </div>

        {!(interns as Profile[])?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>등록된 인턴이 없습니다.</div>
        ) : (
          (interns as Profile[]).map(intern => {
            const internReports = reports.filter(r => r.intern_id === intern.id)

            return (
              <div key={intern.id} style={{ marginBottom: 36 }}>
                {/* 인턴 헤더 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 10,
                  marginBottom: 12,
                  borderBottom: '2px solid #E8EDF3',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#1F4E79', color: '#fff',
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {intern.name.slice(0, 2)}
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{intern.name}</span>
                      <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                        {intern.department}
                        {intern.mentor_id ? ` · 멘토: ${mentorMap[intern.mentor_id] ?? '—'}` : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#375623', fontWeight: 600 }}>
                      총 {internReports.length}회 제출
                    </span>
                    {internReports.length > 0 && (
                      <Link
                        href={`/mentor/interview/print?internId=${intern.id}`}
                        target="_blank"
                        style={{
                          fontSize: 12, color: '#595959',
                          border: '1.5px solid #ddd',
                          padding: '5px 12px', borderRadius: 7,
                          textDecoration: 'none', fontWeight: 600,
                        }}
                      >
                        🖨 전체 출력
                      </Link>
                    )}
                  </div>
                </div>

                {/* 보고서 목록 */}
                {!internReports.length ? (
                  <div style={{ color: '#ccc', fontSize: 13, fontStyle: 'italic', padding: '10px 4px' }}>
                    제출된 면담보고서가 없습니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {internReports.map(r => (
                      <div key={r.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#fff',
                        border: '1px solid #E8EDF3',
                        borderLeft: '3px solid #A9D18E',
                        borderRadius: 8,
                        padding: '10px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {r.week_number && (
                            <span style={{
                              background: '#EEF3F9', color: '#1F4E79',
                              fontSize: 11, fontWeight: 700,
                              padding: '2px 8px', borderRadius: 6,
                              whiteSpace: 'nowrap',
                            }}>
                              W{r.week_number}
                            </span>
                          )}
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                            {fmtDate(r.interview_date)}
                          </span>
                          {r.content && (
                            <span style={{
                              fontSize: 12, color: '#888',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              maxWidth: 360,
                            }}>
                              {r.content}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/mentor/interview/${r.id}/print`}
                          target="_blank"
                          style={{
                            fontSize: 11, color: '#888',
                            border: '1px solid #ddd',
                            padding: '4px 10px', borderRadius: 6,
                            textDecoration: 'none', fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          🖨 출력
                        </Link>
                      </div>
                    ))}
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
