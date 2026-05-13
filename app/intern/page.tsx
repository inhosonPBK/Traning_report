import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import ReportForm from '@/components/ReportForm'
import { getWeekInfo, TOTAL_WEEKS } from '@/lib/weeks'
import { Report } from '@/types'
import Link from 'next/link'

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1)

export default async function InternPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const { profile } = await requireProfile(['intern', 'hr'])

  // week 파라미터가 있으면 기존 폼 렌더링
  if (searchParams.week) {
    return (
      <>
        <NavBar profile={profile} />
        <ReportForm profile={profile} />
      </>
    )
  }

  // week 파라미터 없으면 대시보드
  const admin = createAdminClient()
  const { data: rawReports } = await admin
    .from('reports')
    .select('id, week_number, status')
    .eq('intern_id', profile.id)

  const reports = (rawReports || []) as Pick<Report, 'id' | 'week_number' | 'status'>[]
  const reportByWeek = Object.fromEntries(reports.map(r => [r.week_number, r]))

  const completedCount = reports.filter(r => r.status === 'completed').length
  const submittedCount = reports.filter(r => r.status === 'submitted').length
  const draftCount = reports.filter(r => r.status === 'draft').length
  const progressPct = Math.round((completedCount / TOTAL_WEEKS) * 100)

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '32px auto', padding: '0 24px 80px' }}>

        {/* 프로필 헤더 */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8EDF3',
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#1F4E79', color: '#fff',
              fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {profile.name.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                {profile.department}{profile.position ? ` · ${profile.position}` : ''}
              </div>
            </div>
          </div>

          {/* 진행 현황 */}
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#375623' }}>{completedCount}</div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>완료</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1F4E79' }}>{submittedCount}</div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>제출</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#C55A11' }}>{draftCount}</div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>초안</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#595959' }}>{progressPct}%</div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>진행률</div>
            </div>
          </div>
        </div>

        {/* 섹션 타이틀 */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1F4E79', marginBottom: 14 }}>
          주간 보고서 (Week 1 – {TOTAL_WEEKS})
        </div>

        {/* 20주 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
        }}>
          {WEEKS.map(w => {
            const r = reportByWeek[w]
            const isEmpty = !r
            const isDraft = r?.status === 'draft'
            const isSubmitted = r?.status === 'submitted'
            const isCompleted = r?.status === 'completed'

            let bg = '#F8FAFC'
            let border = '1.5px solid #E8EDF3'
            let numColor = '#ccc'
            let badgeBg = ''
            let badgeColor = ''
            let badgeText = ''

            if (isDraft) {
              bg = '#FFFBF5'
              border = '1.5px solid #FDBA74'
              numColor = '#C55A11'
              badgeBg = '#FFF7ED'
              badgeColor = '#C55A11'
              badgeText = '✎ 초안'
            } else if (isSubmitted) {
              bg = '#F0F6FF'
              border = '1.5px solid #93C5FD'
              numColor = '#1F4E79'
              badgeBg = '#DBEAFE'
              badgeColor = '#1F4E79'
              badgeText = '● 제출'
            } else if (isCompleted) {
              bg = '#F0FAF4'
              border = '1.5px solid #A9D18E'
              numColor = '#375623'
              badgeBg = '#E2EFDA'
              badgeColor = '#375623'
              badgeText = '✓ 완료'
            }

            return (
              <Link key={w} href={`/intern?week=${w}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: bg,
                  border,
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isEmpty ? '#ccc' : numColor }}>
                      W{w}
                    </span>
                    {badgeText && (
                      <span style={{
                        background: badgeBg, color: badgeColor,
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 10,
                        border: `1px solid ${badgeColor}33`,
                        whiteSpace: 'nowrap',
                      }}>
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 6 }}>
                      {getWeekInfo(w)}
                    </div>
                    {isEmpty && (
                      <div style={{ fontSize: 11, color: '#ccc', marginTop: 4, fontWeight: 600 }}>+ 작성하기</div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
