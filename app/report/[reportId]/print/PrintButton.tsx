'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        position: 'fixed', bottom: 24, right: 24,
        background: '#1F4E79', color: '#fff', border: 'none',
        padding: '10px 20px', borderRadius: 8,
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(31,78,121,.3)',
      }}
      className="no-print"
    >
      🖨 Print / Save as PDF
    </button>
  )
}
