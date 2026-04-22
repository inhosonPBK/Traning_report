'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://traning-report.vercel.app/auth/reset',
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
        <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 12, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginBottom: 8 }}>이메일을 확인하세요</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
            <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.<br />
            이메일의 링크를 클릭해 새 비밀번호를 설정해 주세요.
          </div>
          <Link href="/login" style={{ display: 'inline-block', marginTop: 24, color: '#1F4E79', fontSize: 14, fontWeight: 600 }}>
            ← 로그인 페이지로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#1F4E79', padding: '12px 28px', borderRadius: '10px 10px 0 0', width: '100%', maxWidth: 400 }}>
        <div style={{ color: '#9DC3E6', fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 2 }}>
          PBK Operations Team · Promega Biosystems Korea
        </div>
        <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>비밀번호 재설정</div>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', padding: '28px 28px 24px', borderRadius: '0 0 12px 12px', width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
      >
        <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="your@promega.com"
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
          {loading ? '전송 중…' : '재설정 링크 보내기 →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#999' }}>
          <Link href="/login" style={{ color: '#1F4E79', fontWeight: 600 }}>← 로그인으로 돌아가기</Link>
        </div>
      </form>
    </div>
  )
}
