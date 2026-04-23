import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import { InterviewReport, Profile } from '@/types'
import Link from 'next/link'

export default async function InterviewListPage() {
  const { profile } = await requireProfile('mentor')
  const admin = createAdminClient()

  // 담당 인턴 조회 (여러 명 가능)
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
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>면담 보고서</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>인턴 월간 면담 보고서 작성 및 관리</div>
          </div>
          <Link href="/mentor" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 600 }}>← 주간 레포트</Link>
        </div>

        {!interns?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>담당 인턴이 없습니다.</div>
        ) : (
          (interns as Profile[]).map(intern => {
            const internReports = (reports || []).filter((r: InterviewReport) => r.intern_id === intern.id)
            return (
              <div key={intern.id} className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{intern.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      {intern.department}{intern.position ? ` · ${intern.position}` : ''}
                    </div>
                  </div>
                  <Link
                    href={`/mentor/interview/new?internId=${intern.id}`}
                    style={{ background: '#1F4E79', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                  >
                    + 새 면담 보고서
                  </Link>
                </div>

                {!internReports.length ? (
                  <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>작성된 면담 보고서가 없습니다.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(internReports as InterviewReport[]).map(r => (
                      <Link key={r.id} href={`/mentor/interview/${r.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E8EDF3', borderRadius: 8, padding: '12px 16px' }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1F4E79' }}>
                              {r.interview_date ? new Date(r.interview_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '날짜 미입력'}
                            </span>
                            {r.content && (
                              <div style={{ fontSize: 12, color: '#888', marginTop: 2, maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.content}
                              </div>
                            )}
                          </div>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: r.status === 'submitted' ? '#E2EFDA' : '#F9FAFB',
                            color: r.status === 'submitted' ? '#375623' : '#999',
                            border: r.status === 'submitted' ? '1px solid #A9D18E' : '1px solid #ddd',
                          }}>
                            {r.status === 'submitted' ? '✓ 제출 완료' : 'Draft'}
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
