import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ManagerInterviewDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireProfile(['manager', 'hr'])
  const admin = createAdminClient()

  const { data: report } = await admin
    .from('interview_reports')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!report) redirect('/manager')

  const [{ data: intern }, { data: mentor }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', report.intern_id).single(),
    admin.from('profiles').select('*').eq('id', report.mentor_id).single(),
  ])

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    display: 'block',
  }

  const fieldStyle: React.CSSProperties = {
    background: '#F9FAFB',
    border: '1px solid #E8EDF3',
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 14,
    color: '#333',
    minHeight: 60,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
  }

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 800, margin: '28px auto', padding: '0 20px 80px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/manager" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 600 }}>
            ← All Reports
          </Link>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginTop: 12 }}>면담 보고서</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
            {intern?.name} · {intern?.department}{intern?.position ? ` · ${intern.position}` : ''}
            {report.interview_date && ` · ${new Date(report.interview_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </div>
        </div>

        <div className="card">
          {/* 메타 정보 */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E8EDF3' }}>
            <div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>인턴</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{intern?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>멘토</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{mentor?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>면담일</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {report.interview_date
                  ? new Date(report.interview_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </div>
            </div>
          </div>

          {/* 면담내용 */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>면담 내용</label>
            <div style={fieldStyle}>{report.content || '—'}</div>
          </div>

          {/* 건의 및 문의 */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>건의 및 문의</label>
            <div style={fieldStyle}>{report.suggestions || '—'}</div>
          </div>

          {/* 조치사항 */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>조치사항</label>
            <div style={fieldStyle}>{report.action_items || '—'}</div>
          </div>

          {/* 기타 */}
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>기타</label>
            <div style={fieldStyle}>{report.other || '—'}</div>
          </div>
        </div>
      </div>
    </>
  )
}
