import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { InterviewReport } from '@/types'
import PrintButton from '@/app/report/[reportId]/print/PrintButton'

export default async function InterviewFullPrintPage({
  searchParams,
}: {
  searchParams: { internId?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: viewer } = await admin.from('profiles').select('role, is_hr_viewer').eq('id', user.id).single()
  const allowed = viewer && (
    ['mentor', 'manager', 'hr', 'gm'].includes(viewer.role) || viewer.is_hr_viewer
  )
  if (!allowed) redirect('/dashboard')

  const internId = searchParams.internId
  if (!internId) redirect('/mentor/interview')

  const { data: intern } = await admin
    .from('profiles')
    .select('*')
    .eq('id', internId)
    .single()

  if (!intern) notFound()

  const { data: rawReports } = await admin
    .from('interview_reports')
    .select('*')
    .eq('intern_id', internId)
    .eq('status', 'submitted')
    .order('week_number', { ascending: true })

  const reports = (rawReports || []) as InterviewReport[]

  const fmtDate = (d: string | null) => {
    if (!d) return '—'
    const dt = new Date(d)
    return `${String(dt.getFullYear()).slice(2)}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #fff !important; margin: 0; }
        .wrap { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; line-height: 1.5; padding: 28px 32px; max-width: 1000px; margin: 0 auto; }
        .ph { border-bottom: 3px solid #1F4E79; padding-bottom: 14px; margin-bottom: 20px; }
        .ph-label { color: #2E75B6; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; margin-bottom: 3px; }
        .ph-title { font-size: 18px; font-weight: 700; color: #1F4E79; }
        .ph-meta { font-size: 12px; color: #777; margin-top: 3px; }
        .tbl { width: 100%; border-collapse: collapse; border: 1.5px solid #333; }
        .tbl th, .tbl td { border: 1px solid #888; padding: 7px 9px; vertical-align: top; }
        .tbl thead th { background: #EEF3F9; font-size: 11px; font-weight: 700; color: #1F4E79; text-align: center; }
        .tbl tbody td { font-size: 12px; }
        .td-center { text-align: center; }
        .td-content { white-space: pre-wrap; min-height: 48px; }
        .empty-row { text-align: center; color: #aaa; font-style: italic; padding: 32px; }
        .p-print-btn { position: fixed; bottom: 24px; right: 24px; background: #1F4E79; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(31,78,121,.3); }
        @media print { .p-print-btn { display: none !important; } .wrap { padding: 16px; } }
      `}</style>

      <div className="wrap">
        {/* 헤더 */}
        <div className="ph">
          <div className="ph-label">Promega Korea · Promega Biosystems Korea</div>
          <div className="ph-title">청년친화강소기업 — 면담일지</div>
          <div className="ph-meta">
            {intern.name} · {intern.department}{intern.position ? ` · ${intern.position}` : ''}
            &nbsp;|&nbsp; 총 {reports.length}회 면담
          </div>
        </div>

        {/* 정부 양식 테이블 */}
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 40 }}>연번</th>
              <th style={{ width: 70 }}>성명</th>
              <th style={{ width: 90 }}>근무부서</th>
              <th style={{ width: 80 }}>면담일</th>
              <th>면담내용 및 청년 건의사항</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">제출된 면담보고서가 없습니다.</td>
              </tr>
            ) : (
              reports.map((r, idx) => (
                <tr key={r.id}>
                  <td className="td-center">{idx + 1}</td>
                  <td className="td-center">{intern.name}</td>
                  <td className="td-center">{intern.department ?? '—'}</td>
                  <td className="td-center">{fmtDate(r.interview_date)}</td>
                  <td className="td-content">{r.content || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 16 }}>
          출력일: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <PrintButton />
    </>
  )
}
