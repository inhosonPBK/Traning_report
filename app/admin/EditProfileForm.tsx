'use client'

import { useState, useTransition } from 'react'
import { updateUserProfile } from './actions'

export default function EditProfileForm({
  userId,
  userName,
  currentTeam,
  currentPosition,
}: {
  userId: string
  userName: string
  currentTeam: string | null
  currentPosition: string | null
}) {
  const [open, setOpen] = useState(false)
  const [department, setDepartment] = useState(currentTeam || '')
  const [position, setPosition] = useState(currentPosition || '')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
      <div style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Edit {userName}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 130 }}
        />
        <button
          disabled={isPending}
          onClick={() => {
            const fd = new FormData()
            fd.append('userId', userId)
            fd.append('department', department)
            fd.append('position', position)
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
          style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
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
