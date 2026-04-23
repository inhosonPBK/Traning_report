'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Profile } from '@/types'

export default function NavBar({ profile }: { profile: Profile }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="nav no-print" style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '0 32px' }}>
      <div style={{ padding: '14px 0' }}>
        <div style={{ color: '#9DC3E6', fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 2 }}>
          Promega Korea · Promega Biosystems Korea
        </div>
        <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Weekly Training Report</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#9DC3E6', fontSize: 13 }}>
          {profile.name} · <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
        </span>
        {profile.role === 'hr' && (
          <Link href="/hr" style={{ color: '#cce3f5', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '7px 14px', borderRadius: 7, background: 'rgba(255,255,255,.08)' }}>
            All Reports
          </Link>
        )}
        {profile.role === 'manager' && (
          <Link href="/manager" style={{ color: '#cce3f5', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '7px 14px', borderRadius: 7, background: 'rgba(255,255,255,.08)' }}>
            Team Reports
          </Link>
        )}
        {profile.is_admin && (
          <Link href="/admin" style={{ color: '#cce3f5', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '7px 14px', borderRadius: 7, background: 'rgba(255,255,255,.08)' }}>
            Admin
          </Link>
        )}
        <Link href="/settings" style={{ color: '#cce3f5', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '7px 14px', borderRadius: 7, background: 'rgba(255,255,255,.08)' }}>
          ⚙ Settings
        </Link>
        <button
          onClick={handleLogout}
          style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#cce3f5', padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
