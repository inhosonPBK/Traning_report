'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Profile, Report, InterviewReport } from '@/types'

export interface InternData {
  intern: Profile
  reports: Report[]
  interviewReports: InterviewReport[]
  mentorName: string | null
}

interface Props {
  internsData: InternData[]
  groupByTeam?: boolean
  viewerRole: 'mentor' | 'manager' | 'hr'
}

const WEEK_TOTAL = 20

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return name.slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = ['#1F4E79', '#375623', '#C55A11', '#3730A3', '#0E7490', '#7C3AED', '#B45309']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function reportHref(r: Report, viewerRole: 'mentor' | 'manager' | 'hr'): string | null {
  if (viewerRole === 'mentor') {
    return r.status === 'draft' ? null : `/mentor/${r.id}`
  }
  if (r.status === 'completed') return `/report/${r.id}/print`
  if (r.status === 'submitted') return `/manager/report/${r.id}`
  return null
}

const WEEK_STYLE: Record<string, { bg: string; border: string; color: string; icon: string; label: string }> = {
  completed: { bg: '#E2EFDA', border: '#A9D18E', color: '#375623', icon: '✓', label: '완료' },
  submitted: { bg: '#EEF2FF', border: '#C7D2FE', color: '#3730A3', icon: '●', label: '제출됨' },
  draft:     { bg: '#F5F5F5', border: '#E0E0E0', color: '#888',    icon: '✎', label: '작성 중' },
  empty:     { bg: '#FAFAFA', border: '#EEEEEE', color: '#ccc',    icon: '—', label: '미작성' },
}

export default function InternCardGrid({ internsData, groupByTeam = false, viewerRole }: Props) {
  const [selected, setSelected] = useState<InternData | null>(null)

  // Team grouping
  const grouped: { team: string; items: InternData[] }[] = groupByTeam
    ? Array.from(
        internsData.reduce((map, d) => {
          const team = d.intern.department || '기타'
          if (!map.has(team)) map.set(team, [])
          map.get(team)!.push(d)
          return map
        }, new Map<string, InternData[]>())
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([team, items]) => ({ team, items }))
    : [{ team: '', items: internsData }]

  return (
    <div>
      {grouped.map(({ team, items }) => (
        <div key={team}>
          {groupByTeam && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#888',
              textTransform: 'uppercase', letterSpacing: 1,
              marginBottom: 12, marginTop: 8, paddingLeft: 2,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ display: 'inline-block', width: 3, height: 14, borderRadius: 2, background: '#1F4E79' }} />
              {team} 팀
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
            marginBottom: groupByTeam ? 28 : 0,
          }}>
            {items.map(d => {
              const { intern, reports, interviewReports } = d
              const completedCount = reports.filter(r => r.status === 'completed').length
              const submittedCount = reports.filter(r => r.status === 'submitted').length
              const progressPct = Math.round((reports.filter(r => r.status !== 'draft').length / WEEK_TOTAL) * 100)
              const hasPending = submittedCount > 0
              const isSelected = selected?.intern.id === intern.id

              return (
                <div
                  key={intern.id}
                  onClick={() => setSelected(isSelected ? null : d)}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isSelected ? '#1F4E79' : '#E8EDF3'}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(31,78,121,0.12)'
                      : '0 1px 4px rgba(0,0,0,.05)',
                    transition: 'box-shadow .15s, border-color .15s',
                    position: 'relative',
                  }}
                >
                  {/* Pending dot */}
                  {hasPending && (
                    <span style={{
                      position: 'absolute', top: 14, right: 14,
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#C55A11',
                    }} title="피드백 대기 중" />
                  )}

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: avatarColor(intern.name),
                      color: '#fff', fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {getInitials(intern.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {intern.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {intern.department}{intern.position ? ` · ${intern.position}` : ''}
                        {d.mentorName ? ` · ${d.mentorName}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: '#F4F7FB', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1F4E79' }}>{completedCount}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>완료</div>
                    </div>
                    {submittedCount > 0 && (
                      <div style={{ flex: 1, background: '#EEF2FF', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#3730A3' }}>{submittedCount}</div>
                        <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>검토 대기</div>
                      </div>
                    )}
                    <div style={{ flex: 1, background: '#F4F7FB', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#595959' }}>{interviewReports.length}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>면담</div>
                    </div>
                    <div style={{ flex: 1, background: '#F4F7FB', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1F4E79' }}>{progressPct}%</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>진행률</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 4, background: '#E8EDF3', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #1F4E79, #2D7FC1)',
                      borderRadius: 2,
                      transition: 'width .4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 4, textAlign: 'right' }}>
                    {reports.filter(r => r.status !== 'draft').length} / {WEEK_TOTAL}주
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Slide Panel */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.25)',
              zIndex: 200,
            }}
          />

          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0,
            width: 480, maxWidth: '95vw',
            height: '100vh',
            background: '#fff',
            boxShadow: '-4px 0 24px rgba(0,0,0,.15)',
            zIndex: 201,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #E8EDF3',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: avatarColor(selected.intern.name),
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getInitials(selected.intern.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1F4E79' }}>{selected.intern.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>
                      {selected.intern.department}{selected.intern.position ? ` · ${selected.intern.position}` : ''}
                      {selected.mentorName ? ` · Mentor: ${selected.mentorName}` : ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 20, color: '#aaa', padding: '4px 8px',
                    borderRadius: 6, lineHeight: 1,
                  }}
                >✕</button>
              </div>
            </div>

            {/* Panel Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>

              {/* Week Grid */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#555',
                  textTransform: 'uppercase', letterSpacing: 0.6,
                  marginBottom: 12,
                }}>주간 레포트 현황</div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  {Object.entries(WEEK_STYLE).map(([key, s]) => (
                    <span key={key} style={{ fontSize: 10, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: s.bg, border: `1px solid ${s.border}` }} />
                      {s.label}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {Array.from({ length: WEEK_TOTAL }, (_, i) => {
                    const weekNum = i + 1
                    const r = selected.reports.find(r => r.week_number === weekNum)
                    const statusKey = r ? r.status : 'empty'
                    const s = WEEK_STYLE[statusKey]
                    const href = r ? reportHref(r, viewerRole) : null
                    const isNewTab = r?.status === 'completed' && viewerRole !== 'mentor'

                    const cellContent = (
                      <div style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 8,
                        padding: '8px 4px 6px',
                        textAlign: 'center',
                        cursor: href ? 'pointer' : 'default',
                        opacity: statusKey === 'draft' ? 0.6 : 1,
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: s.color, opacity: 0.7, marginBottom: 2 }}>W{weekNum}</div>
                        <div style={{ fontSize: 13, lineHeight: 1 }}>{s.icon}</div>
                        <div style={{ fontSize: 8, color: s.color, marginTop: 2 }}>{s.label}</div>
                      </div>
                    )

                    if (href) {
                      return (
                        <Link
                          key={weekNum}
                          href={href}
                          target={isNewTab ? '_blank' : undefined}
                          style={{ textDecoration: 'none' }}
                          onClick={() => setSelected(null)}
                        >
                          {cellContent}
                        </Link>
                      )
                    }
                    return <div key={weekNum}>{cellContent}</div>
                  })}
                </div>
              </div>

              {/* Interview Reports */}
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#555',
                  textTransform: 'uppercase', letterSpacing: 0.6,
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>📋</span> 면담 보고서
                  <span style={{
                    background: '#E8EDF3', color: '#777',
                    fontSize: 10, fontWeight: 700,
                    borderRadius: 10, padding: '1px 7px',
                  }}>{selected.interviewReports.length}</span>
                </div>

                {!selected.interviewReports.length ? (
                  <div style={{ color: '#ccc', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>면담 보고서가 없습니다.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.interviewReports.map(r => {
                      const interviewHref = viewerRole === 'mentor'
                        ? `/mentor/interview/${r.id}`
                        : `/manager/interview/${r.id}`
                      return (
                        <Link
                          key={r.id}
                          href={interviewHref}
                          style={{ textDecoration: 'none' }}
                          onClick={() => setSelected(null)}
                        >
                          <div style={{
                            background: '#F9FAFB',
                            border: '1px solid #E8EDF3',
                            borderRadius: 8,
                            padding: '10px 14px',
                            cursor: 'pointer',
                            transition: 'background .12s',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#595959' }}>
                                  {r.interview_date
                                    ? new Date(r.interview_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : '날짜 미입력'}
                                </div>
                                {r.content && (
                                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.content}
                                  </div>
                                )}
                              </div>
                              <span style={{
                                padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                                background: r.status === 'submitted' ? '#E2EFDA' : '#FFF7ED',
                                color: r.status === 'submitted' ? '#375623' : '#C55A11',
                                border: `1px solid ${r.status === 'submitted' ? '#A9D18E' : '#FDBA74'}`,
                                flexShrink: 0,
                              }}>
                                {r.status === 'submitted' ? '✓ 제출 완료' : '✎ 작성 중'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
