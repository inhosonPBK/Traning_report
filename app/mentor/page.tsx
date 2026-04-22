import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import StatusBadge from '@/components/StatusBadge'
import { getWeekInfo } from '@/lib/weeks'
import { Report } from '@/types'
import Link from 'next/link'

export default async function MentorPage() {
  const { profile } = await requireProfile('mentor')
  const admin = createAdminClient()

  const { data: intern } = await admin.from('profiles').select('*').eq('mentor_id', profile.id).single()
  const { data: reports } = intern
    ? await admin.from('reports').select('*').eq('intern_id', intern.id).order('week_number')
    : { data: [] }

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Intern Reports</div>
          {intern && <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{intern.name} · {intern.department}</div>}
        </div>
        {!intern ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No intern assigned.</div>
        ) : !reports?.length ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No reports submitted yet.</div>
        ) : (
          (reports as Report[]).map(r => (
            <Link key={r.id} href={`/mentor/${r.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', marginBottom: 12, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>Week {r.week_number} · {getWeekInfo(r.week_number)}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{r.topic || '(No topic)'}</div>
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
