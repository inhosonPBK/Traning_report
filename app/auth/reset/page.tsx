'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkExpired, setLinkExpired] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // URL 쿼리 파라미터 또는 해시에서 에러 감지
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))

    const errorCode = params.get('error_code') || hashParams.get('error_code')
    const errorParam = params.get('error') || hashParams.get('error')

    if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
      setLinkExpired(true)
      return
    }

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
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

    await supabase.auth.signOut()
    router.push('/login')
  }

  // 링크 만료 에러 화면
  if (linkExpired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
        <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 12, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏱</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#C55A11', marginBottom: 12 }}>Link Expired</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: 28 }}>
            The reset link is only valid for <strong>1 hour</strong>.<br />
            Please request a new link.
          </div>
          <Link
            href="/forgot-password"
            style={{
              display: 'inline-block',
              background: '#1F4E79',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            Request New Link →
          </Link>
          <div>
            <Link href="/login" style={{ color: '#999', fontSize: 13, textDecoration: 'none' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 토큰 확인 대기 화면
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
        <div style={{ color: '#666', fontSize: 14 }}>Verifying link…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#1F4E79', padding: '12px 28px', borderRadius: '10px 10px 0 0', width: '100%', maxWidth: 400 }}>
        <div style={{ color: '#9DC3E6', fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 2 }}>
          Promega Korea · Promega Biosystems Korea
        </div>
        <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Set New Password</div>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', padding: '28px 28px 24px', borderRadius: '0 0 12px 12px', width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
            style={{ width: '100%', border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Re-enter password"
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
          {loading ? 'Saving…' : 'Update Password →'}
        </button>
      </form>
    </div>
  )
}
