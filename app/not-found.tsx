import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#EEF2F7',
    }}>
      <div style={{
        background: '#fff',
        padding: '48px 40px',
        borderRadius: 14,
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,.08)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1F4E79', marginBottom: 10 }}>
          Page Not Found
        </div>
        <div style={{ fontSize: 14, color: '#888', lineHeight: 1.8, marginBottom: 28 }}>
          The page you are looking for does not exist or has been moved.
        </div>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-block',
            background: '#1F4E79',
            color: '#fff',
            padding: '11px 28px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  )
}
