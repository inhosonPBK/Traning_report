'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface ReportPayload {
  weekNumber: number
  topic: string
  learned: string
  rating: string
  feeling: string
  questions: string
}

export async function saveReport(payload: ReportPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // 이미 submitted/completed인 경우 draft로 덮어쓰지 않도록 현재 상태 확인
  const { data: existing } = await admin
    .from('reports')
    .select('status')
    .eq('intern_id', user.id)
    .eq('week_number', payload.weekNumber)
    .maybeSingle()

  if (existing?.status === 'submitted' || existing?.status === 'completed') {
    return { error: 'Cannot overwrite a submitted report via auto-save' }
  }

  const { data, error } = await admin
    .from('reports')
    .upsert({
      intern_id: user.id,
      week_number: payload.weekNumber,
      topic: payload.topic,
      learned: payload.learned,
      rating: payload.rating || null,
      feeling: payload.feeling,
      questions: payload.questions,
      status: 'draft',
    }, { onConflict: 'intern_id,week_number' })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/intern')
  return { data }
}

export async function submitReport(payload: ReportPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('reports')
    .upsert({
      intern_id: user.id,
      week_number: payload.weekNumber,
      topic: payload.topic,
      learned: payload.learned,
      rating: payload.rating || null,
      feeling: payload.feeling,
      questions: payload.questions,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'intern_id,week_number' })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/intern')
  return { data }
}

export async function recallReport(weekNumber: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // completed(멘토 리뷰 완료)인 레포트는 회수 불가
  const { data: existing } = await admin
    .from('reports')
    .select('status')
    .eq('intern_id', user.id)
    .eq('week_number', weekNumber)
    .single()

  if (!existing) return { error: 'Report not found' }
  if (existing.status === 'completed') return { error: '멘토가 이미 피드백을 완료해 회수할 수 없습니다.' }

  const { data, error } = await admin
    .from('reports')
    .update({ status: 'draft', submitted_at: null })
    .eq('intern_id', user.id)
    .eq('week_number', weekNumber)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/intern')
  return { data }
}
