import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getWeekInfo } from '@/lib/weeks'
import { Report, Rating } from '@/types'
import PrintButton from './PrintButton'

const RATINGS: Rating[] = ['Excellent', 'Good', 'Okay', 'Tough']
const PROGRESS = ['On Track', 'Minor Adjustment', 'Review Required']

export default async function PrintPage({ params }: { params: { reportId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: report } = await admin.from('reports').select('*').eq('id', params.reportId).single()
  if (!report) notFound()

  const { data: intern } = await admin.from('profiles').select('*').eq('id', report.intern_id).single()
  const { data: mentor } = report.mentor_id
    ? await admin.from('profiles').select('*').eq('id', report.mentor_id).single()
    : { data: null }

  return (
    <>
      {/* 프린트 페이지 전용 스타일 — root layout의 globals.css 위에 덮어씀 */}
      <style>{`
        body { background: #fff !important; }
        .print-wrap { font-family: 'DM Sans', 'Malgun Gothic', sans-serif; background: #fff; color: #1a1a1a; font-size: 14px; line-height: 1.6; padding: 32px; max-width: 900px; margin: 0 auto; }
        .ph { border-bottom: 3px solid #1F4E79; padding-bottom: 16px; margin-bottom: 24px; }
        .ph-label { color: #2E75B6; font-size: 10px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; margin-bottom: 4px; }
        .ph-title { font-size: 20px; font-weight: 700; color: #1F4E79; }
        .ph-meta { font-size: 13px; color: #777; margin-top: 4px; }
        .pc { border: 1px solid #E8EDF3; border-radius: 8px; padding: 20px 24px; margin-bottom: 14px; page-break-inside: avoid; }
        .ps-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .ps-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .ps-title { font-size: 14px; font-weight: 700; }
        .pf-label { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
        .p-content { background: #f9f9f9; border: 1px solid #E8EDF3; border-radius: 6px; padding: 10px 14px; white-space: pre-wrap; min-height: 40px; font-size: 13px; line-height: 1.7; }
        .p-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .p-pill { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid #ddd; background: #fff; color: #888; }
        .p-pill.navy { border-color: #1F4E79; background: #1F4E79; color: #fff; }
        .p-pill.gray { border-color: #595959; background: #595959; color: #fff; }
        .pm-table { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .pm-row { display: flex; border-bottom: 1px solid #ddd; }
        .pm-row:last-child { border-bottom: none; }
        .pm-label { width: 140px; min-width: 140px; background: #F4F4F4; border-right: 1px solid #ddd; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #595959; }
        .pm-content { flex: 1; padding: 10px 12px; font-size: 13px; white-space: pre-wrap; line-height: 1.6; }
        .p-status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #E2EFDA; color: #375623; }
        .p-print-btn { position: fixed; bottom: 24px; right: 24px; background: #1F4E79; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(31,78,121,.3); }
        @media print { .p-print-btn { display: none !important; } body { padding: 0; } .print-wrap { padding: 20px; } }
      `}</style>

      <div className="print-wrap">
        {/* 헤더 */}
        <div className="ph">
          <div className="ph-label">PBK Operations Team · Promega Biosystems Korea</div>
          <div className="ph-title">Weekly Training Report</div>
          <div className="ph-meta">
            {intern?.name} · {intern?.department}&nbsp;|&nbsp;
            Week {report.week_number} · {getWeekInfo(report.week_number)}
            {report.topic ? ` · ${report.topic}` : ''}
            &nbsp;|&nbsp; <span className="p-status">✓ Completed</span>
          </div>
        </div>

        {/* S01 */}
        <div className="pc">
          <div className="ps-header">
            <div className="ps-num" style={{ background: '#1F4E79' }}>01</div>
            <span className="ps-title" style={{ color: '#1F4E79' }}>What I Learned This Week</span>
          </div>
          <div className="p-content">{report.learned || '—'}</div>
        </div>

        {/* S02 */}
        <div className="pc">
          <div className="ps-header">
            <div className="ps-num" style={{ background: '#1F4E79' }}>02</div>
            <span className="ps-title" style={{ color: '#1F4E79' }}>How Was This Week</span>
          </div>
          <div className="pf-label">Overall Rating</div>
          <div className="p-pills">
            {RATINGS.map(r => (
              <span key={r} className={`p-pill${report.rating === r ? ' navy' : ''}`}>{r}</span>
            ))}
          </div>
          <div className="p-content">{report.feeling || '—'}</div>
        </div>

        {/* S03 */}
        <div className="pc">
          <div className="ps-header">
            <div className="ps-num" style={{ background: '#C55A11' }}>03</div>
            <span className="ps-title" style={{ color: '#C55A11' }}>Questions &amp; What I Want to Know More</span>
          </div>
          <div className="p-content">{report.questions || '—'}</div>
        </div>

        {/* S04 멘토 피드백 */}
        <div className="pc" style={{ borderTop: '3px solid #595959' }}>
          <div className="ps-header">
            <div className="ps-num" style={{ background: '#595959' }}>04</div>
            <span className="ps-title" style={{ color: '#595959' }}>Mentor Feedback</span>
          </div>
          {mentor && (
            <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', marginBottom: 12 }}>
              Reviewed by {mentor.name}
            </div>
          )}
          <div className="pm-table">
            <div className="pm-row">
              <div className="pm-label">This week<br />good at</div>
              <div className="pm-content">{report.mentor_good || '—'}</div>
            </div>
            <div className="pm-row">
              <div className="pm-label">Next week<br />focus</div>
              <div className="pm-content">{report.mentor_next || '—'}</div>
            </div>
            <div className="pm-row">
              <div className="pm-label">Q&amp;A<br />summary</div>
              <div className="pm-content">{report.mentor_qa || '—'}</div>
            </div>
            <div className="pm-row">
              <div className="pm-label">Progress<br />status</div>
              <div className="pm-content">
                <div className="p-pills" style={{ marginBottom: 0 }}>
                  {PROGRESS.map(p => (
                    <span key={p} className={`p-pill${report.mentor_progress === p ? ' gray' : ''}`}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 20 }}>
          Completed {report.completed_at
            ? new Date(report.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : ''}
        </div>
      </div>

      {/* 프린트 버튼 — Client Component (onClick 사용) */}
      <PrintButton />
    </>
  )
}
