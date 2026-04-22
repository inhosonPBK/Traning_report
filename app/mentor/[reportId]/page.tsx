import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getProfile } from '@/lib/get-profile'
import NavBar from '@/components/NavBar'
import StatusBadge from '@/components/StatusBadge'
import MentorReview from '@/components/MentorReview'
import { getWeekInfo } from '@/lib/weeks'
import { Report, Rating } from '@/types'
import Link from 'next/link'

const RATINGS: Rating[] = ['Excellent', 'Good', 'Okay', 'Tough']

export default async function MentorReportPage({ params }: { params: { reportId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.role !== 'mentor') redirect('/dashboard')

  const admin = createAdminClient()
  const { data: report } = await admin.from('reports').select('*').eq('id', params.reportId).single()
  if (!report) notFound()

  const { data: intern } = await admin.from('profiles').select('*').eq('id', report.intern_id).single()

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <Link href="/mentor" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>← All Reports</Link>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginTop: 4 }}>
              Week {report.week_number} · {getWeekInfo(report.week_number)}
            </div>
            {intern && <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>{intern.name} · {intern.department}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <StatusBadge status={(report as Report).status} />
            {report.status === 'completed' && (
              <a href={`/report/${report.id}/print`} target="_blank"
                style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                🖨 Print / PDF
              </a>
            )}
          </div>
        </div>

        {report.topic && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Topic</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{report.topic}</div>
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="sec-num" style={{ background: '#1F4E79' }}>01</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>What I Learned This Week</span>
          </div>
          <textarea rows={7} value={report.learned ?? ''} disabled />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="sec-num" style={{ background: '#1F4E79' }}>02</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>How Was This Week</span>
          </div>
          <div className="field-label" style={{ marginBottom: 8 }}>Overall</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {RATINGS.map(r => (
              <button key={r} disabled className={`pill${report.rating === r ? ' selected-navy' : ''}`}>{r}</button>
            ))}
          </div>
          <textarea rows={5} value={report.feeling ?? ''} disabled />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="sec-num" style={{ background: '#C55A11' }}>03</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#C55A11' }}>Questions &amp; What I Want to Know More</span>
          </div>
          <textarea rows={6} value={report.questions ?? ''} disabled />
        </div>

        <MentorReview report={report as Report} mentorId={user.id} />
      </div>
    </>
  )
}
