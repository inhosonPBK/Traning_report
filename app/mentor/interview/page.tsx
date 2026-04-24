import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import { InterviewReport, Profile } from '@/types'
import Link from 'next/link'

export default async function InterviewListPage() {
  const { profile } = await requireProfile('mentor')
  const admin = createAdminClient()

  const { data: interns } = await admin
    .from('profiles')
    .select('*')
    .eq('mentor_id', profile.id)
    .eq('status', 'approved')

  const internIds = (interns || []).map((i: any) => i.id)
  const { data: reports } = internIds.length > 0
    ? await admin
        .from('interview_reports')
        .select('*')
        .in('intern_id', internIds)
        .order('interview_date', { ascending: false })
    : { data: [] }

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 24px 80px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/mentor" style={{ fontSize: 13, color: '#888', fontWeight: 600, textDecoration: 'none' }}>
            ← 돌아가기
          </Link>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1F4E79', marginTop: 10 }}>면담 보고서</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 3 }}>인턴 면담 보고서 작성 및 관리</div>
        </div>

        {!interns?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>담당 인턴이 없습니다.</div>
        ) : (
          (interns as Profile[]).map(intern => {
            const internReports = (reports || []).filter((r: InterviewReport) => r.intern_id === intern.id)
            const draftCount = internReports.filter(r => r.status === 'draft').length

            return (
              <div key={intern.id} style={{ marginBottom: 32 }}>

                {/* 인턴 헤더 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: '2px solid #E8EDF3',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: '#1F4E79', color: '#fff',
                      fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {intern.name.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{intern.name}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>
                        {intern.department}{intern.position ? ` · ${intern.position}` : ''}
                        {' · '}
                        <span style={{ color: '#1F4E79', fontWeight: 600 }}>{internReports.length}건</span>
                        {draftCount > 0 && (
                          <span style={{
                            marginLeft: 6,
                            background: '#FFF7ED', color: '#C55A11',
                            border: '1px solid #FDBA74',
                            borderRadius: 10, padding: '1px 7px',
                            fontSize: 10, fontWeight: 700,
                          }}>
                            Draft {draftCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/mentor/interview/new?internId=${intern.id}`}
                    style={{
                      background: '#1F4E79', color: '#fff',
                      padding: '8px 16px', borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    + 새 면담 보고서
                  </Link>
                </div>

                {/* 보고서 목록 */}
                {!internReports.length ? (
                  <div style={{ color: '#bbb', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
                    작성된 면담 보고서가 없습니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(internReports as InterviewReport[]).map(r => (
                      <Link key={r.id} href={`/mentor/interview/${r.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fff',
                          border: `1px solid ${r.status === 'draft' ? '#FDBA74' : '#E8EDF3'}`,
                          borderLeft: `3px solid ${r.status === 'draft' ? '#C55A11' : '#A9D18E'}`,
                          borderRadius: 8,
                          padding: '12px 16px',
                          cursor: 'pointer',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                              {r.interview_date
                                ? new Date(r.interview_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '날짜 미입력'}
                            </div>
                            {r.content && (
                              <div style={{
                                fontSize: 12, color: '#888', marginTop: 3,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                maxWidth: 500,
                              }}>
                                {r.content}
                              </div>
                            )}
                          </div>
                          <span style={{
                            flexShrink: 0,
                            marginLeft: 12,
                            padding: '3px 10px', borderRadius: 20,
                            fontSize: 11, fontWeight: 700,
                            background: r.status === 'submitted' ? '#E2EFDA' : '#FFF7ED',
                            color: r.status === 'submitted' ? '#375623' : '#C55A11',
                            border: `1px solid ${r.status === 'submitted' ? '#A9D18E' : '#FDBA74'}`,
                          }}>
                            {r.status === 'submitted' ? '✓ 제출 완료' : '✎ 작성 중'}
                          </span>
                        </div>
                      </Link>
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
