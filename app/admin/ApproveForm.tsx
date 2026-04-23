'use client'

import { useState, useTransition } from 'react'
import { approveUser, rejectUser } from './actions'
import { Profile } from '@/types'

const ROLE_OPTIONS = [
  { value: 'intern', label: 'Intern (입력자)' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'manager', label: 'Manager (전체 열람)' },
]

export default function ApproveForm({ user, mentors }: { user: Profile; mentors: Profile[] }) {
  const [role, setRole] = useState('intern')
  const [mentorId, setMentorId] = useState('')
  const [department, setDepartment] = useState(user.department || '')
  const [position, setPosition] = useState(user.position || '')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) return <div style={{ color: '#375623', fontSize: 13, fontWeight: 600 }}>✓ Processed</div>

  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E8EDF3', borderRadius: 8, padding: 16, marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Team</label>
          <input
            value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="e.g. Operations"
            style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 140 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Position</label>
          <input
            value={position}
            onChange={e => setPosition(e.target.value)}
            placeholder="e.g. Engineer Intern"
            style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 160 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
          >
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {role === 'intern' && (
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Paired Mentor</label>
            <select
              value={mentorId}
              onChange={e => setMentorId(e.target.value)}
              style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
            >
              <option value="">— select mentor —</option>
              {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.department}{m.position ? ` · ${m.position}` : ''})</option>)}
            </select>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <form action={async (fd) => {
          fd.append('userId', user.id)
          fd.append('role', role)
          fd.append('department', department)
          fd.append('position', position)
          if (role === 'intern') fd.append('mentorId', mentorId)
          startTransition(async () => { await approveUser(fd); setDone(true) })
        }}>
          <button
            type="submit"
            disabled={isPending || (role === 'intern' && !mentorId)}
            style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.7 : 1, fontFamily: 'inherit' }}
          >
            ✓ Approve
          </button>
        </form>
        <form action={async (fd) => {
          fd.append('userId', user.id)
          if (confirm(`Reject and delete ${user.name}?`)) {
            startTransition(async () => { await rejectUser(fd); setDone(true) })
          }
        }}>
          <button
            type="submit"
            disabled={isPending}
            style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ✕ Reject
          </button>
        </form>
      </div>
    </div>
  )
}
