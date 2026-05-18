'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InterviewReport, Profile } from '@/types'

export interface InternSection {
  intern: Profile
  reports: InterviewReport[]
  mentorName: string | null
}

const fmtDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
}

export default function InterviewViewerAccordion({ sections }: { sections: InternSection[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const allOpen = openIds.size === sections.length

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allOpen) setOpenIds(new Set())
    else setOpenIds(new Set(sections.map(s => s.intern.id)))
  }

  return (
    <div>
      {/* 전체 펼치기/접기 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={toggleAll}
          style={{
            background: 'none', border: '1.5px solid #ddd',
            color: '#666', padding: '5px 14px', borderRadius: 7,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {allOpen ? '전체 접기 ▲' : '전체 펼치기 ▼'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map(({ intern, reports, mentorName }) => {
          const isOpen = openIds.has(intern.id)
          return (
            <div key={intern.id} style={{
              background: '#fff',
              border: '1px solid #E8EDF3',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {/* 헤더 — 클릭으로 토글 */}
              <button
                onClick={() => toggle(intern.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: isOpen ? '#F4F7FB' : '#fff',
                  border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background .1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
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
                      {intern.department}{mentorName ? ` · 멘토: ${mentorName}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: reports.length > 0 ? '#375623' : '#aaa',
                  }}>
                    총 {reports.length}회 제출
                  </span>
                  {reports.length > 0 && (
                    <Link
                      href={`/mentor/interview/print?internId=${intern.id}`}
                      target="_blank"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: 12, color: '#595959',
                        border: '1.5px solid #ddd',
                        padding: '5px 12px', borderRadius: 7,
                        textDecoration: 'none', fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🖨 전체 출력
                    </Link>
                  )}
                  <span style={{ fontSize: 12, color: '#aaa', marginLeft: 2, minWidth: 14 }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* 펼쳐진 보고서 목록 */}
              {isOpen && (
                <div style={{
                  borderTop: '1px solid #E8EDF3',
                  padding: '12px 18px 14px',
                  background: '#FAFBFC',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {!reports.length ? (
                    <div style={{ color: '#ccc', fontSize: 13, fontStyle: 'italic', padding: '6px 0' }}>
                      제출된 면담보고서가 없습니다.
                    </div>
                  ) : (
                    reports.map(r => (
                      <div key={r.id} style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#fff',
                        border: '1px solid #E8EDF3',
                        borderLeft: '3px solid #A9D18E',
                        borderRadius: 8,
                        padding: '10px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', flexShrink: 0 }}>
                            {fmtDate(r.interview_date)}
                          </span>
                          {r.content && (
                            <span style={{
                              fontSize: 12, color: '#888',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
                            flexShrink: 0, marginLeft: 12,
                          }}
                        >
                          🖨 출력
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
