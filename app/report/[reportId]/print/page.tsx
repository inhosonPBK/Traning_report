import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getWeekInfo } from '@/lib/weeks'
import { Report, Rating } from '@/types'

const RATINGS: Rating[] = ['Excellent', 'Good', 'Okay', 'Tough']
const PROGRESS = ['On Track', 'Minor Adjustment', 'Review Required']

export default async function PrintPage({ params }: { params: { reportId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: report } = await supabase.from('reports').select('*').eq('id', params.reportId).single()
  if (!report) notFound()

  const { data: intern } = await supabase.from('profiles').select('*').eq('id', report.intern_id).single()
  const { data: mentor } = report.mentor_id
    ? await supabase.from('profiles').select('*').eq('id', report.mentor_id).single()
    : { data: null }

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>Weekly Training Report — Week {report.week_number} · {intern?.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', 'Malgun Gothic', sans-serif; background: #fff; color: #1a1a1a; font-size: 14px; line-height: 1.6; padding: 32px; }
          .header { border-bottom: 3px solid #1F4E79; padding-bottom: 16px; margin-bottom: 24px; }
          .header-label { color: #2E75B6; font-size: 10px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; margin-bottom: 4px; }
          .header-title { font-size: 20px; font-weight: 700; color: #1F4E79; }
          .header-meta { font-size: 13px; color: #777; margin-top: 4px; }
          .card { border: 1px solid #E8EDF3; border-radius: 8px; padding: 20px 24px; margin-bottom: 14px; page-break-inside: avoid; }
          .sec-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
          .sec-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
          .sec-title { font-size: 14px; font-weight: 700; }
          .field-label { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
          .content-box { background: #f9f9f9; border: 1px solid #E8EDF3; border-radius: 6px; padding: 10px 14px; white-space: pre-wrap; min-height: 40px; font-size: 13px; line-height: 1.7; }
          .pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
          .pill { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid #ddd; background: #fff; color: #888; }
          .pill.active-navy { border-color: #1F4E79; background: #1F4E79; color: #fff; }
          .pill.active-gray { border-color: #595959; background: #595959; color: #fff; }
          .mentor-table { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
          .mentor-row { display: flex; border-bottom: 1px solid #ddd; }
          .mentor-row:last-child { border-bottom: none; }
          .mentor-label { width: 140px; min-width: 140px; background: #F4F4F4; border-right: 1px solid #ddd; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #595959; }
          .mentor-content { flex: 1; padding: 10px 12px; font-size: 13px; white-space: pre-wrap; line-height: 1.6; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #E2EFDA; color: #375623; }
          .print-btn { position: fixed; bottom: 24px; right: 24px; background: #1F4E79; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
          @media print { .print-btn { display: none; } body { padding: 20px; } }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="header-label">PBK Operations Team · Promega Biosystems Korea</div>
          <div className="header-title">Weekly Training Report</div>
          <div className="header-meta">
            {intern?.name} · {intern?.department} &nbsp;|&nbsp;
            Week {report.week_number} · {getWeekInfo(report.week_number)}
            {report.topic ? ` · ${report.topic}` : ''}
            &nbsp;|&nbsp; <span className="status-badge">✓ Completed</span>
          </div>
        </div>

        {/* S01 */}
        <div className="card">
          <div className="sec-header">
            <div className="sec-num" style={{ background: '#1F4E79' }}>01</div>
            <span className="sec-title" style={{ color: '#1F4E79' }}>What I Learned This Week</span>
          </div>
          <div className="content-box">{report.learned || '—'}</div>
        </div>

        {/* S02 */}
        <div className="card">
          <div className="sec-header">
            <div className="sec-num" style={{ background: '#1F4E79' }}>02</div>
            <span className="sec-title" style={{ color: '#1F4E79' }}>How Was This Week</span>
          </div>
          <div className="field-label">Overall Rating</div>
          <div className="pills">
            {RATINGS.map(r => (
              <span key={r} className={`pill${report.rating === r ? ' active-navy' : ''}`}>{r}</span>
            ))}
          </div>
          <div className="content-box">{report.feeling || '—'}</div>
        </div>

        {/* S03 */}
        <div className="card">
          <div className="sec-header">
            <div className="sec-num" style={{ background: '#C55A11' }}>03</div>
            <span className="sec-title" style={{ color: '#C55A11' }}>Questions & What I Want to Know More</span>
          </div>
          <div className="content-box">{report.questions || '—'}</div>
        </div>

        {/* S04 */}
        <div className="card" style={{ borderTop: '3px solid #595959' }}>
          <div className="sec-header">
            <div className="sec-num" style={{ background: '#595959' }}>04</div>
            <span className="sec-title" style={{ color: '#595959' }}>Mentor Feedback</span>
          </div>
          {mentor && <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', marginBottom: 12 }}>Reviewed by {mentor.name}</div>}
          <div className="mentor-table">
            <div className="mentor-row">
              <div className="mentor-label">This week<br />good at</div>
              <div className="mentor-content">{report.mentor_good || '—'}</div>
            </div>
            <div className="mentor-row">
              <div className="mentor-label">Next week<br />focus</div>
              <div className="mentor-content">{report.mentor_next || '—'}</div>
            </div>
            <div className="mentor-row">
              <div className="mentor-label">Q&amp;A<br />summary</div>
              <div className="mentor-content">{report.mentor_qa || '—'}</div>
            </div>
            <div className="mentor-row">
              <div className="mentor-label">Progress<br />status</div>
              <div className="mentor-content">
                <div className="pills" style={{ marginBottom: 0 }}>
                  {PROGRESS.map(p => (
                    <span key={p} className={`pill${report.mentor_progress === p ? ' active-gray' : ''}`}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 20 }}>
          Completed {report.completed_at ? new Date(report.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </div>

        <button className="print-btn" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
      </body>
    </html>
  )
}
