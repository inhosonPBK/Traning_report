'use client'

import { useState, useTransition } from 'react'
import { updateUserProfile } from './actions'
import { Profile } from '@/types'

const ROLE_OPTIONS = [
  { value: 'intern',  label: 'Intern' },
  { value: 'mentor',  label: 'Mentor' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr',      label: 'HR' },
]

export default function EditProfileForm({
  userId,
  userName,
  currentTeam,
  currentPosition,
  currentRole,
  currentMentorId,
  currentIsHrViewer,
  mentors,
}: {
  userId: string
  userName: string
  currentTeam: string | null
  currentPosition: string | null
  currentRole: string | null
  currentMentorId: string | null
  currentIsHrViewer: boolean
  mentors: Pick<Profile, 'id' | 'name'>[]
}) {
  const [open, setOpen] = useState(false)
  const [department, setDepartment] = useState(currentTeam || '')
  const [position, setPosition] = useState(currentPosition || '')
  const [role, setRole] = useState(currentRole || 'intern')
  const [mentorId, setMentorId] = useState(currentMentorId || '')
  const [isHrViewer, setIsHrViewer] = useState(currentIsHrViewer || false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const needsMentor = role === 'intern' || role === 'hr'

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Edit
      </button>
    )
  }

  if (message && !isError) {
    return (
      <div style={{ fontSize: 12, color: '#375623', fontWeight: 600 }}>✅ Saved</div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 300 }}>
      <div style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Edit {userName}</div>

      {/* 첫 줄: Role + Team + Position */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '6px 8px', fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff', width: 90 }}
        >
          {ROLE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={department}
          onChange={e => setDepartment(e.target.value)}
          placeholder="Team"
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 100 }}
        />
        <input
          type="text"
          value={position}
          onChange={e => setPosition(e.target.value)}
          placeholder="Position"
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 120 }}
        />
      </div>

      {/* 면담보고서 열람 권한 */}
      <label style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
        <input
          type="checkbox"
          checked={isHrViewer}
          onChange={e => setIsHrViewer(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
        면담보고서 열람 권한 (HR 보조)
      </label>

      {/* 둘째 줄: Mentor (intern/hr 역할만) */}
      {needsMentor && (
        <select
          value={mentorId}
          onChange={e => setMentorId(e.target.value)}
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '6px 8px', fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff', width: '100%' }}
        >
          <option value="">— Mentor 선택 (선택사항) —</option>
          {mentors.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      )}

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          disabled={isPending}
          onClick={() => {
            const fd = new FormData()
            fd.append('userId', userId)
            fd.append('department', department)
            fd.append('position', position)
            fd.append('role', role)
            fd.append('mentorId', needsMentor ? mentorId : '')
            fd.append('isHrViewer', String(isHrViewer))
            startTransition(async () => {
              const result = await updateUserProfile(fd)
              if (result.error) {
                setMessage(result.error)
                setIsError(true)
              } else {
                setMessage('success')
                setIsError(false)
              }
            })
          }}
          style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.6 : 1, fontFamily: 'inherit' }}
        >
          {isPending ? '…' : 'Save'}
        </button>
        <button
          onClick={() => { setOpen(false); setMessage(''); setIsError(false) }}
          style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {message && isError && (
        <div style={{ color: '#C55A11', fontSize: 12 }}>⚠ {message}</div>
      )}
    </div>
  )
}
