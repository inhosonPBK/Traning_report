import { requireProfile } from '@/lib/get-profile'
import { createAdminClient } from '@/lib/supabase-admin'
import NavBar from '@/components/NavBar'
import ApproveForm from './ApproveForm'
import { Profile } from '@/types'
import Link from 'next/link'

export default async function AdminPage() {
  const { profile } = await requireProfile('manager')
  const admin = createAdminClient()

  const { data: pending } = await admin.from('profiles').select('*').eq('status', 'pending').order('created_at')
  const { data: approved } = await admin.from('profiles').select('*').eq('status', 'approved').order('role')
  const mentors = (approved || []).filter((p: Profile) => p.role === 'mentor')

  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Admin Panel</div>
          <Link href="/manager" style={{ fontSize: 13, color: '#1F4E79', textDecoration: 'none', fontWeight: 600 }}>View All Reports →</Link>
        </div>

        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#C55A11' }}>
            Pending Approval
            {pending?.length ? <span style={{ marginLeft: 8, background: '#FCE4D6', color: '#C55A11', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{pending.length}</span> : null}
          </div>
          {!pending?.length ? (
            <div style={{ color: '#aaa', fontSize: 14 }}>No pending requests.</div>
          ) : (
            (pending as Profile[]).map(u => (
              <div key={u.id} style={{ borderBottom: '1px solid #E8EDF3', paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                <div style={{ fontSize: 13, color: '#777' }}>{u.email}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  {u.department || '—'} · {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <ApproveForm user={u} mentors={mentors} />
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1F4E79' }}>Active Users</div>
          {!approved?.length ? (
            <div style={{ color: '#aaa', fontSize: 14 }}>No approved users yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E8EDF3' }}>
                  {['Name', 'Email', 'Role', 'Department', 'Paired Mentor'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(approved as Profile[]).map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #E8EDF3' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: u.role === 'intern' ? '#EEF2FF' : u.role === 'mentor' ? '#E2EFDA' : '#FCE4D6', color: u.role === 'intern' ? '#3730A3' : u.role === 'mentor' ? '#375623' : '#C55A11' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '10px', color: '#666' }}>{u.department || '—'}</td>
                    <td style={{ padding: '10px', color: '#666' }}>
                      {u.mentor_id ? (approved as Profile[]).find(m => m.id === u.mentor_id)?.name || '—' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
