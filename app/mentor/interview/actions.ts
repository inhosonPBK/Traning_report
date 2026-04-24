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

interface InterviewUpsertData {
  mentor_id: string
  intern_id: string
  interview_date: string | null
  content: string
  suggestions: string
  action_items: string
  other: string
  status: 'draft' | 'submitted'
}

/** Verify the current user is the assigned mentor for the given intern */
async function verifyMentorOwnership(userId: string, internId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data: intern } = await admin
    .from('profiles')
    .select('mentor_id')
    .eq('id', internId)
    .single()
  return intern?.mentor_id === userId
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

  // Verify caller is the assigned mentor for this intern
  const authorized = await verifyMentorOwnership(user.id, payload.internId)
  if (!authorized) return { error: 'Not authorized' }

  const admin = createAdminClient()

  const upsertData: InterviewUpsertData = {
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
    // Block updates on already-submitted reports
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

  // Verify caller is the assigned mentor for this intern
  const authorized = await verifyMentorOwnership(user.id, payload.internId)
  if (!authorized) return { error: 'Not authorized' }

  const admin = createAdminClient()

  const upsertData: InterviewUpsertData = {
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
