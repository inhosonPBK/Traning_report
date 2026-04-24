import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import { getWeekInfo } from '@/lib/weeks'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const RATING_COLOR: Record<string, string> = {
  Excellent: '#375623',
  Good: '#1F4E79',
  Okay: '#595959',
  Tough: '#C55A11',
}

export default async function ManagerReportDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireProfile(['manager', 'hr'])
  const admin = createAdminClient()

  const { data: report } = await admin
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!report) redirect('/manager')

  const [{ data: intern }, { data: mentor }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', report.intern_id).single(),
    report.mentor_id
      ? admin.from('profiles').select('*').eq('id', report.mentor_id).single()
      : Promise.resolve({ data: null }),
  ])

  const fieldStyle: React.CSSProperties = {
    background: '#F9FAFB',
    border: '1px solid #E8EDF3',
    borderRadius: 8,
    padding: '14px 16px',
    fontSize: 14,
    color: '#333',
    minHeight: 60,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.8,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    display: 'block',
  }

  const isSubmitted = report.status === 'submitted'
  const isCompleted = report.status === 'completed'

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 800, margin: '28px auto', padding: '0 20px 80px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/manager" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 600 }}>
            ← All Reports
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>
              {intern?.name} — Week {report.week_number}
            </div>
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: isCompleted ? '#E2EFDA' : isSubmitted ? '#EEF2FF' : '#F5F5F5',
              color: isCompleted ? '#375623' : isSubmitted ? '#3730A3' : '#999',
              border: `1px solid ${isCompleted ? '#A9D18E' : isSubmitted ? '#C7D2FE' : '#ddd'}`,
            }}>
              {isCompleted ? '✓ Completed' : isSubmitted ? '● Submitted' : 'Draft'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
            {intern?.department}{intern?.position ? ` · ${intern.position}` : ''}
            {' · '}{getWeekInfo(report.week_number)}
            {report.topic && ` · ${report.topic}`}
          </div>
        </div>

        {/* 멘토 피드백 대기 안내 */}
        {isSubmitted && (
          <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: '#3730A3', fontSize: 13 }}>Awaiting Mentor Feedback</div>
              <div style={{ fontSize: 12, color: '#3730A3', marginTop: 1 }}>
                This report has been submitted. Waiting for mentor feedback.
              </div>
            </div>
          </div>
        )}

        {/* 인턴 작성 내용 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1F4E79', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>01</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>What I Learned This Week</span>
          </div>
          <div style={fieldStyle}>{report.learned || '(not filled)'}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1F4E79', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>02</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>How Was This Week</span>
          </div>
          {report.rating && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#EEF2F7', color: RATING_COLOR[report.rating] ?? '#333', border: '1px solid #E8EDF3' }}>
                {report.rating}
              </span>
            </div>
          )}
          <div style={fieldStyle}>{report.feeling || '(not filled)'}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#C55A11', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>03</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#C55A11' }}>Questions &amp; What I Want to Know More</span>
          </div>
          <div style={fieldStyle}>{report.questions || '(not filled)'}</div>
        </div>

        {/* 멘토 피드백 (completed일 때만) */}
        {isCompleted && (
          <div className="card" style={{ borderLeft: '3px solid #595959' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#595959', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>04</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#595959' }}>Mentor Feedback</span>
              {mentor && <span style={{ fontSize: 12, color: '#aaa' }}>by {mentor.name}</span>}
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                { label: 'This week good at', value: report.mentor_good },
                { label: 'Next week focus', value: report.mentor_next },
                { label: 'Q&A summary', value: report.mentor_qa },
              ].map(f => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <div style={fieldStyle}>{f.value || '—'}</div>
                </div>
              ))}
              {report.mentor_progress && (
                <div>
                  <label style={labelStyle}>Progress status</label>
                  <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#F5F5F5', color: '#595959', border: '1px solid #ddd' }}>
                    {report.mentor_progress}
                  </span>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <a
                href={`/report/${report.id}/print`}
                target="_blank"
                style={{ fontSize: 12, color: '#888', textDecoration: 'none', border: '1.5px solid #ddd', padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}
              >
                🖨 Print / PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
