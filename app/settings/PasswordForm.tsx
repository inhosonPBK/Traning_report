'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function PasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setNewPassword('')
      setConfirm('')
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79', marginBottom: 20 }}>비밀번호 변경</div>

      {success && (
        <div style={{ background: '#E2EFDA', border: '1px solid #A9D18E', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#375623', fontWeight: 600, fontSize: 14 }}>
          ✅ 비밀번호가 변경되었습니다.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder="8자 이상"
            style={{ width: '100%', border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>비밀번호 확인</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="비밀번호 재입력"
            style={{ width: '100%', border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>

        {error && (
          <div style={{ color: '#C55A11', fontSize: 13, marginBottom: 14, background: '#FFF3EE', border: '1px solid #FCE4D6', borderRadius: 8, padding: '10px 14px' }}>
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
        >
          {loading ? '변경 중…' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  )
}
