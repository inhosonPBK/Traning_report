import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import PrintButton from '@/app/report/[reportId]/print/PrintButton'

export default async function InterviewPrintPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Allow mentor, manager, hr roles
  const { data: viewer } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!viewer || !['mentor', 'manager', 'hr'].includes(viewer.role)) redirect('/dashboard')

  const { data: report } = await admin
    .from('interview_reports')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!report) notFound()

  const [{ data: intern }, { data: mentor }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', report.intern_id).single(),
    admin.from('profiles').select('*').eq('id', report.mentor_id).single(),
  ])

  const interviewDate = report.interview_date
    ? new Date(report.interview_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const submittedAt = report.updated_at
    ? new Date(report.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <>
      <style>{`
        body { background: #fff !important; }
        .print-wrap { font-family: 'DM Sans', 'Malgun Gothic', sans-serif; background: #fff; color: #1a1a1a; font-size: 14px; line-height: 1.6; padding: 32px; max-width: 860px; margin: 0 auto; }
        .ph { border-bottom: 3px solid #1F4E79; padding-bottom: 16px; margin-bottom: 24px; }
        .ph-label { color: #2E75B6; font-size: 10px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; margin-bottom: 4px; }
        .ph-title { font-size: 20px; font-weight: 700; color: #1F4E79; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #E8EDF3; border-radius: 8px; overflow: hidden; }
        .info-table tr { border-bottom: 1px solid #E8EDF3; }
        .info-table tr:last-child { border-bottom: none; }
        .info-table td { padding: 10px 14px; font-size: 13px; }
        .info-label { width: 140px; background: #F4F7FB; font-weight: 700; color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { color: #1a1a1a; }
        .pc { border: 1px solid #E8EDF3; border-radius: 8px; padding: 18px 20px; margin-bottom: 14px; page-break-inside: avoid; }
        .sec-label { font-size: 10px; font-weight: 700; color: '#555'; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; display: block; color: #555; }
        .p-content { background: #f9fafb; border: 1px solid #E8EDF3; border-radius: 6px; padding: 10px 14px; white-space: pre-wrap; min-height: 40px; font-size: 13px; line-height: 1.7; }
        .p-footer { font-size: 11px; color: #aaa; text-align: center; margin-top: 24px; }
        .p-print-btn { position: fixed; bottom: 24px; right: 24px; background: #1F4E79; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(31,78,121,.3); }
        @media print { .p-print-btn { display: none !important; } body { padding: 0; } .print-wrap { padding: 20px; } }
      `}</style>

      <div className="print-wrap">
        {/* Header */}
        <div className="ph">
          <div className="ph-label">Promega Korea · Promega Biosystems Korea</div>
          <div className="ph-title">Interview Report</div>
        </div>

        {/* Info Table */}
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-label">Intern</td>
              <td className="info-value">{intern?.name ?? '—'}</td>
            </tr>
            <tr>
              <td className="info-label">Department</td>
              <td className="info-value">
                {intern?.department ?? '—'}
                {intern?.position ? ` · ${intern.position}` : ''}
              </td>
            </tr>
            <tr>
              <td className="info-label">Interview Date</td>
              <td className="info-value">{interviewDate}</td>
            </tr>
            <tr>
              <td className="info-label">Mentor</td>
              <td className="info-value">{mentor?.name ?? '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Content */}
        <div className="pc">
          <span className="sec-label">Content</span>
          <div className="p-content">{report.content || '—'}</div>
        </div>

        <div className="pc">
          <span className="sec-label">Suggestions</span>
          <div className="p-content">{report.suggestions || '—'}</div>
        </div>

        <div className="pc">
          <span className="sec-label">Action Items</span>
          <div className="p-content">{report.action_items || '—'}</div>
        </div>

        <div className="pc">
          <span className="sec-label">Other</span>
          <div className="p-content">{report.other || '—'}</div>
        </div>

        {submittedAt && (
          <div className="p-footer">Submitted {submittedAt}</div>
        )}
      </div>

      <PrintButton />
    </>
  )
}
