'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export async function signUpAction(formData: {
  name: string
  email: string
  password: string
  department: string
  position: string
}) {
  const admin = createAdminClient()

  // 1. 이미 가입된 이메일인지 확인
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('email', formData.email)
    .maybeSingle()

  if (existing) return { error: 'This email is already registered.' }

  // 2. auth 계정 생성 (admin API — email_confirm: true로 즉시 활성화)
  //    앱 접근 제어는 status='pending' → 'approved' 승인 흐름으로 처리
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { name: formData.name, department: formData.department, position: formData.position },
  })

  if (authError) return { error: authError.message }

  // 3. profiles 테이블에 pending 행 삽입
  const { error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    name: formData.name,
    email: formData.email,
    department: formData.department,
    position: formData.position,
    status: 'pending',
    is_admin: false,
  })

  if (profileError) {
    // 프로필 생성 실패 시 auth 계정도 롤백
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  return { success: true }
}
