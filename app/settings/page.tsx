import { requireProfile } from '@/lib/get-profile'
import NavBar from '@/components/NavBar'
import PasswordForm from './PasswordForm'

export default async function SettingsPage() {
  const { profile } = await requireProfile()
  return (
    <>
      <NavBar profile={profile} />
      <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 20px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginBottom: 24 }}>Account Settings</div>
        <PasswordForm />
      </div>
    </>
  )
}
