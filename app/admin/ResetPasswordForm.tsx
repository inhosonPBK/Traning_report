'use client'

import { useState, useTransition } from 'react'
import { resetUserPassword } from './actions'

export default function ResetPasswordForm({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Reset PW
      </button>
    )
  }

  if (message && !isError) {
    return (
      <div style={{ fontSize: 12, color: '#375623', fontWeight: 600 }}>✅ 초기화 완료</div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
      <div style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>{userName} 임시 비밀번호 설정</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="text"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="8자 이상 임시 비밀번호"
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 170 }}
        />
        <button
          disabled={isPending || password.length < 8}
          onClick={() => {
            const fd = new FormData()
            fd.append('userId', userId)
            fd.append('newPassword', password)
            startTransition(async () => {
              const result = await resetUserPassword(fd)
              if (result.error) {
                setMessage(result.error)
                setIsError(true)
              } else {
                setMessage('success')
                setIsError(false)
              }
            })
          }}
          style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: isPending || password.length < 8 ? 'default' : 'pointer', opacity: isPending || password.length < 8 ? 0.6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          {isPending ? '…' : '초기화'}
        </button>
        <button
          onClick={() => { setOpen(false); setPassword(''); setMessage(''); setIsError(false) }}
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
