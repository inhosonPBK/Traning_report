'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Supabase가 URL hash의 토큰을 세션으로 교환하기를 기다림
  useEffect(() => {
    const supabase = createClient()
    // onAuthStateChange가 PASSWORD_RECOVERY 이벤트를 처리
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    // 이미 세션이 있는 경우 (직접 방문)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

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
      setLoading(false)
      return
    }

    // 성공 — 로그인 페이지로 이동
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
        <div style={{ color: '#666', fontSize: 14 }}>링크를 확인하는 중…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#1F4E79', padding: '12px 28px', borderRadius: '10px 10px 0 0', width: '100%', maxWidth: 400 }}>
        <div style={{ color: '#9DC3E6', fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 2 }}>
          PBK Operations Team · Promega Biosystems Korea
        </div>
        <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>새 비밀번호 설정</div>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', padding: '28px 28px 24px', borderRadius: '0 0 12px 12px', width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
      >
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
          style={{ width: '100%', background: '#1F4E79', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
        >
          {loading ? '변경 중…' : '비밀번호 변경 →'}
        </button>
      </form>
    </div>
  )
}
