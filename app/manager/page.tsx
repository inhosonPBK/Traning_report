import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import StatusBadge from '@/components/StatusBadge'
import { getWeekInfo } from '@/lib/weeks'
import { Profile, Report } from '@/types'
import Link from 'next/link'

export default async function ManagerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'manager') redirect('/dashboard')

  const admin = createAdminClient()

  // All interns
  const { data: interns } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'intern')
    .eq('status', 'approved')
    .order('department', { ascending: true })

  // All mentors (for name lookup)
  const { data: mentors } = await admin
    .from('profiles')
    .select('id, name')
    .eq('role', 'mentor')

  // All reports
  const { data: reports } = await admin
    .from('reports')
    .select('*')
    .order('week_number', { ascending: true })

  const mentorMap = Object.fromEntries((mentors || []).map((m: any) => [m.id, m.name]))

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 960, margin: '28px auto', padding: '0 20px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>All Reports — Manager View</div>
          <Link href="/admin" style={{ fontSize: 13, color: '#1F4E79', fontWeight: 600, textDecoration: 'none' }}>
            Admin Panel →
          </Link>
        </div>

        {!interns?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0', fontSize: 15 }}>No interns registered yet.</div>
        ) : (
          (interns as Profile[]).map(intern => {
            const internReports = (reports || []).filter((r: Report) => r.intern_id === intern.id)
            const mentor = intern.mentor_id ? mentorMap[intern.mentor_id] : null

            return (
              <div key={intern.id} className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{intern.name}</div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>
                      {intern.department}
                      {mentor ? ` · Mentor: ${mentor}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {internReports.length} report{internReports.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {!internReports.length ? (
                  <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>No reports yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {internReports.map((r: Report) => (
                      <Link key={r.id} href={r.status === 'completed' ? `/report/${r.id}/print` : '#'} target={r.status === 'completed' ? '_blank' : undefined} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: '#F9FAFB', border: '1px solid #E8EDF3', borderRadius: 8,
                          padding: '12px 16px',
                          cursor: r.status === 'completed' ? 'pointer' : 'default',
                          opacity: r.status === 'draft' ? 0.6 : 1,
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1F4E79' }}>Week {r.week_number}</span>
                            <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{getWeekInfo(r.week_number)}</span>
                            {r.topic && <span style={{ fontSize: 13, color: '#444', marginLeft: 10 }}>· {r.topic}</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {r.rating && <span style={{ fontSize: 12, color: '#777' }}>{r.rating}</span>}
                            <StatusBadge status={r.status} />
                            {r.status === 'completed' && <span style={{ fontSize: 11, color: '#2E75B6' }}>🖨 PDF</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
