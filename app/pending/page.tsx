import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, status')
    .eq('id', user.id)
    .single()

  // Already approved — go to dashboard
  if (profile?.status === 'approved') redirect('/dashboard')

  async function handleSignOut() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 12, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginBottom: 8 }}>Awaiting Approval</div>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
          Hi, <strong>{profile?.name}</strong>.<br />
          Your account is under review. An administrator will approve your account and assign your role shortly.
        </div>
        <form action={handleSignOut} style={{ marginTop: 28 }}>
          <button
            type="submit"
            style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
