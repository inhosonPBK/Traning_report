'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface FeedbackPayload {
  reportId: string
  mentorGood: string
  mentorNext: string
  mentorQA: string
  progress: string
}

export async function saveMentorFeedback(payload: FeedbackPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // 해당 레포트가 이 멘토의 인턴 것인지 검증
  const { data: report } = await admin
    .from('reports')
    .select('intern_id, status')
    .eq('id', payload.reportId)
    .single()

  if (!report) return { error: 'Report not found' }
  if (report.status === 'completed') return { error: 'Review already completed' }

  // Verify the calling user is the assigned mentor for this intern
  const { data: internProfile } = await admin
    .from('profiles')
    .select('mentor_id')
    .eq('id', report.intern_id)
    .single()
  if (!internProfile || internProfile.mentor_id !== user.id) return { error: 'Not authorized' }

  const { error } = await admin
    .from('reports')
    .update({
      mentor_good: payload.mentorGood,
      mentor_next: payload.mentorNext,
      mentor_qa: payload.mentorQA,
      mentor_progress: payload.progress || null,
      mentor_id: user.id,
    })
    .eq('id', payload.reportId)

  if (error) return { error: error.message }
  revalidatePath('/mentor')
  revalidatePath(`/mentor/${payload.reportId}`)
  return { success: true }
}

export async function completeMentorReview(payload: FeedbackPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Verify the calling user is the assigned mentor for this report's intern
  const { data: report } = await admin
    .from('reports')
    .select('intern_id, status')
    .eq('id', payload.reportId)
    .single()
  if (!report) return { error: 'Report not found' }
  if (report.status === 'completed') return { error: 'Review already completed' }

  const { data: internProfile } = await admin
    .from('profiles')
    .select('mentor_id')
    .eq('id', report.intern_id)
    .single()
  if (!internProfile || internProfile.mentor_id !== user.id) return { error: 'Not authorized' }

  const { error } = await admin
    .from('reports')
    .update({
      mentor_good: payload.mentorGood,
      mentor_next: payload.mentorNext,
      mentor_qa: payload.mentorQA,
      mentor_progress: payload.progress || null,
      mentor_id: user.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', payload.reportId)

  if (error) return { error: error.message }
  revalidatePath('/mentor')
  revalidatePath(`/mentor/${payload.reportId}`)
  return { success: true }
}
