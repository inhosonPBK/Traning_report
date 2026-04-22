import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import StatusBadge from '@/components/StatusBadge'
import { getWeekInfo } from '@/lib/weeks'
import { Report } from '@/types'
import Link from 'next/link'

export default async function MentorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role !== 'mentor') redirect('/intern')

  // Find paired intern
  const { data: intern } = await supabase
    .from('profiles')
    .select('*')
    .eq('mentor_id', user.id)
    .single()

  // Load intern's reports
  const { data: reports } = intern
    ? await supabase
        .from('reports')
        .select('*')
        .eq('intern_id', intern.id)
        .order('week_number', { ascending: true })
    : { data: [] }

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Intern Reports</div>
            {intern && (
              <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                {intern.name} · {intern.department}
              </div>
            )}
          </div>
        </div>

        {!intern ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0', fontSize: 15 }}>No intern assigned.</div>
        ) : !reports?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0', fontSize: 15 }}>No reports submitted yet.</div>
        ) : (
          (reports as Report[]).map(r => (
            <Link key={r.id} href={`/mentor/${r.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', marginBottom: 12, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>
                    Week {r.week_number} · {getWeekInfo(r.week_number)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{r.topic || '(No topic)'}</div>
                  {r.rating && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>Rating: {r.rating}</div>}
                </div>
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
