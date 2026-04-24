'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#1F4E79', padding: '12px 28px', borderRadius: '10px 10px 0 0', width: '100%', maxWidth: 400 }}>
        <div style={{ color: '#9DC3E6', fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 2 }}>
          Promega Korea · Promega Biosystems Korea
        </div>
        <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Weekly Training Report</div>
      </div>
      <form
        onSubmit={handleLogin}
        style={{ background: '#fff', padding: '28px 28px 24px', borderRadius: '0 0 12px 12px', width: '100%', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            style={{ width: '100%', border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ width: '100%', border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        {error && <div style={{ color: '#C55A11', fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: '#1F4E79', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
        >
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#999' }}>
          New user?{' '}
          <Link href="/signup" style={{ color: '#1F4E79', fontWeight: 600 }}>Request Access</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
          <Link href="/forgot-password" style={{ color: '#999', textDecoration: 'none' }}>Forgot your password?</Link>
        </div>
      </form>
    </div>
  )
}
