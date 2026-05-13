import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import { InterviewReport, Profile } from '@/types'
import { getWeekInfo, TOTAL_WEEKS } from '@/lib/weeks'
import Link from 'next/link'

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1)
const PROGRAM_START = new Date('2026-04-20')

/** week_number가 없을 때 interview_date로 주차 추론 */
function inferWeek(r: InterviewReport): number | null {
  if (r.week_number) return r.week_number
  if (!r.interview_date) return null
  const diff = Math.floor((new Date(r.interview_date).getTime() - PROGRAM_START.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const w = diff + 1
  return w >= 1 && w <= TOTAL_WEEKS ? w : null
}

export default async function InterviewListPage() {
  const { profile } = await requireProfile(['mentor', 'hr'])
  const admin = createAdminClient()

  const { data: interns } = await admin
    .from('profiles')
    .select('*')
    .eq('mentor_id', profile.id)
    .eq('status', 'approved')

  const internIds = (interns as Profile[] || []).map(i => i.id)
  const { data: reports } = internIds.length > 0
    ? await admin
        .from('interview_reports')
        .select('*')
        .in('intern_id', internIds)
    : { data: [] }

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 900, margin: '28px auto', padding: '0 24px 80px' }}>

        <div style={{ marginBottom: 28 }}>
          <Link href="/mentor" style={{ fontSize: 13, color: '#888', fontWeight: 600, textDecoration: 'none' }}>
            ← Back
          </Link>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1F4E79', marginTop: 10 }}>Interview Reports</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 3 }}>주간 면담보고서 관리 (Week 1–{TOTAL_WEEKS})</div>
        </div>

        {!interns?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No assigned interns.</div>
        ) : (
          (interns as Profile[]).map(intern => {
            const internReports = (reports || []) as InterviewReport[]
            const myReports = internReports.filter(r => r.intern_id === intern.id)
            // week_number가 없는 기존 보고서는 interview_date로 주차 추론
            const reportByWeek: Record<number, InterviewReport> = {}
            for (const r of myReports) {
              const w = inferWeek(r)
              if (w) reportByWeek[w] = r
            }
            const submittedCount = myReports.filter(r => r.status === 'submitted').length
            const draftCount = myReports.filter(r => r.status === 'draft').length

            return (
              <div key={intern.id} style={{ marginBottom: 40 }}>

                {/* 인턴 헤더 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 12,
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
                        <span style={{ color: '#375623', fontWeight: 600 }}>{submittedCount}회 제출</span>
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
                    href={`/mentor/interview/print?internId=${intern.id}`}
                    target="_blank"
                    style={{
                      background: 'none', color: '#595959',
                      border: '1.5px solid #ddd',
                      padding: '7px 14px', borderRadius: 8,
                      fontSize: 12, fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    🖨 전체 출력
                  </Link>
                </div>

                {/* 20주 그리드 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 8,
                }}>
                  {WEEKS.map(w => {
                    const r = reportByWeek[w]
                    const isEmpty = !r
                    const isDraft = r?.status === 'draft'
                    const isSubmitted = r?.status === 'submitted'

                    let bg = '#F8FAFC'
                    let border = '1.5px solid #E8EDF3'
                    let textColor = '#aaa'
                    let badgeBg = ''
                    let badgeColor = ''
                    let badgeText = ''

                    if (isDraft) {
                      bg = '#FFFBF5'
                      border = '1.5px solid #FDBA74'
                      textColor = '#C55A11'
                      badgeBg = '#FFF7ED'
                      badgeColor = '#C55A11'
                      badgeText = 'Draft'
                    } else if (isSubmitted) {
                      bg = '#F0FAF4'
                      border = '1.5px solid #A9D18E'
                      textColor = '#375623'
                      badgeBg = '#E2EFDA'
                      badgeColor = '#375623'
                      badgeText = '✓'
                    }

                    const href = r
                      ? `/mentor/interview/${r.id}`
                      : `/mentor/interview/new?internId=${intern.id}&week=${w}`

                    return (
                      <Link key={w} href={href} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: bg,
                          border,
                          borderRadius: 10,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.15s',
                          minHeight: 72,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isEmpty ? '#ccc' : textColor }}>
                              W{w}
                            </span>
                            {badgeText && (
                              <span style={{
                                background: badgeBg, color: badgeColor,
                                fontSize: 10, fontWeight: 700,
                                padding: '2px 7px', borderRadius: 10,
                                border: `1px solid ${badgeColor === '#375623' ? '#A9D18E' : '#FDBA74'}`,
                              }}>
                                {badgeText}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: isEmpty ? '#ddd' : '#999', marginTop: 4 }}>
                            {getWeekInfo(w)}
                          </div>
                          {r?.interview_date && (
                            <div style={{ fontSize: 10, color: textColor, marginTop: 2, fontWeight: 600 }}>
                              {new Date(r.interview_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            </div>
                          )}
                          {isEmpty && (
                            <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>+ 작성</div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
