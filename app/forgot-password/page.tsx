import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 12, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginBottom: 12 }}>Forgot your password?</div>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.9, marginBottom: 28 }}>
          Contact your admin to reset your password.<br />
          Once a temporary password is set,<br />
          log in and change it in <strong>Settings</strong>.
        </div>
        <div style={{ background: '#EEF2F7', borderRadius: 10, padding: '16px 20px', marginBottom: 28, fontSize: 14 }}>
          <div style={{ fontWeight: 700, color: '#1F4E79', marginBottom: 4 }}>Inho Son · Admin</div>
          <a href="mailto:inho.son@promega.com" style={{ color: '#1F4E79', textDecoration: 'none', fontWeight: 600 }}>
            inho.son@promega.com
          </a>
        </div>
        <Link href="/login" style={{ color: '#999', fontSize: 13, textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}
