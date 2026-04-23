'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface InterviewPayload {
  id?: string
  internId: string
  interviewDate: string
  content: string
  suggestions: string
  actionItems: string
  other: string
}

export async function getInterviewReports(internId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  const admin = createAdminClient()
  const { data } = await admin
    .from('interview_reports')
    .select('*')
    .eq('intern_id', internId)
    .order('interview_date', { ascending: false })

  return { data: data || [] }
}

export async function getAllInterviewReports() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('interview_reports')
    .select('*')
    .order('interview_date', { ascending: false })

  return { data: data || [] }
}

export async function saveInterviewReport(payload: InterviewPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const upsertData: any = {
    mentor_id: user.id,
    intern_id: payload.internId,
    interview_date: payload.interviewDate || null,
    content: payload.content,
    suggestions: payload.suggestions,
    action_items: payload.actionItems,
    other: payload.other,
    status: 'draft',
  }

  let result
  if (payload.id) {
    // 기존 레코드 업데이트 (submitted 상태면 차단)
    const { data: existing } = await admin
      .from('interview_reports')
      .select('status')
      .eq('id', payload.id)
      .single()
    if (existing?.status === 'submitted') {
      return { error: 'Cannot overwrite a submitted report' }
    }
    result = await admin
      .from('interview_reports')
      .update(upsertData)
      .eq('id', payload.id)
      .select()
      .single()
  } else {
    result = await admin
      .from('interview_reports')
      .insert(upsertData)
      .select()
      .single()
  }

  if (result.error) return { error: result.error.message }
  revalidatePath('/mentor/interview')
  return { data: result.data }
}

export async function submitInterviewReport(payload: InterviewPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const upsertData: any = {
    mentor_id: user.id,
    intern_id: payload.internId,
    interview_date: payload.interviewDate || null,
    content: payload.content,
    suggestions: payload.suggestions,
    action_items: payload.actionItems,
    other: payload.other,
    status: 'submitted',
  }

  let result
  if (payload.id) {
    result = await admin
      .from('interview_reports')
      .update(upsertData)
      .eq('id', payload.id)
      .select()
      .single()
  } else {
    result = await admin
      .from('interview_reports')
      .insert(upsertData)
      .select()
      .single()
  }

  if (result.error) return { error: result.error.message }
  revalidatePath('/mentor/interview')
  revalidatePath('/manager')
  return { data: result.data }
}
