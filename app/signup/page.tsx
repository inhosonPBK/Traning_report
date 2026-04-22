'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUpAction } from './actions'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signUpAction({ name, email, password, department })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
        <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 12, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginBottom: 8 }}>Sign-up request submitted</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
            Your account is pending approval by the administrator.<br />
            You will be able to log in once your account is approved and a role is assigned.
          </div>
          <Link href="/login" style={{ display: 'inline-block', marginTop: 24, color: '#1F4E79', fontSize: 14, fontWeight: 600 }}>← Back to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#1F4E79', padding: '12px 28px', borderRadius: '10px 10px 0 0', width: '100%', maxWidth: 420 }}>
        <div style={{ color: '#9DC3E6', fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 2 }}>
          PBK Operations Team · Promega Biosystems Korea
        </div>
        <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Request Access</div>
      </div>
      <form
        onSubmit={handleSignup}
        style={{ background: '#fff', padding: '28px 28px 24px', borderRadius: '0 0 12px 12px', width: '100%', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
      >
        <p style={{ fontSize: 12, color: '#999', marginBottom: 20, fontStyle: 'italic' }}>
          Your request will be reviewed by an administrator who will assign your role.
        </p>

        {[
          { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'e.g. Hongmin Lee' },
          { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'your@promega.com' },
          { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '8+ characters' },
          { label: 'Team / Department', value: department, setter: setDepartment, type: 'text', placeholder: 'e.g. Procurement' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>{f.label}</label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.setter(e.target.value)}
              required
              placeholder={f.placeholder}
              style={{ width: '100%', border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
        ))}

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
          {loading ? 'Submitting…' : 'Submit Request →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#999' }}>
          Already have an account? <Link href="/login" style={{ color: '#1F4E79', fontWeight: 600 }}>Sign In</Link>
        </div>
      </form>
    </div>
  )
}
