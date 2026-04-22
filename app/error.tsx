'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 12, maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#C55A11', marginBottom: 12 }}>Something went wrong</div>
        <pre style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 6, padding: 12, fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#444', marginBottom: 20 }}>
          {error.message}
        </pre>
        <button onClick={reset} style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          Try Again
        </button>
      </div>
    </div>
  )
}
