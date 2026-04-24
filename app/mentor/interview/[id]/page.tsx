import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import InterviewReportForm from '@/components/InterviewReportForm'
import { redirect } from 'next/navigation'

export default async function InterviewDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireProfile(['mentor', 'hr'])
  const admin = createAdminClient()

  const { data: report } = await admin
    .from('interview_reports')
    .select('*')
    .eq('id', params.id)
    .eq('mentor_id', profile.id)
    .single()

  if (!report) redirect('/mentor/interview')

  const { data: intern } = await admin
    .from('profiles')
    .select('*')
    .eq('id', report.intern_id)
    .single()

  if (!intern) redirect('/mentor/interview')

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 800, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Interview Report</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
              {intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}
              {report.interview_date && ` · ${new Date(report.interview_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            </div>
          </div>
          {report.status === 'submitted' && (
            <a
              href={`/mentor/interview/${report.id}/print`}
              target="_blank"
              style={{ fontSize: 12, color: '#888', textDecoration: 'none', border: '1.5px solid #ddd', padding: '6px 14px', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              🖨 Print / PDF
            </a>
          )}
        </div>
        <div className="card">
          <InterviewReportForm intern={intern} initialReport={report} />
        </div>
      </div>
    </>
  )
}
