export type Role = 'intern' | 'mentor' | 'manager'
export type ProfileStatus = 'pending' | 'approved'
export type ReportStatus = 'draft' | 'submitted' | 'completed'
export type Rating = 'Excellent' | 'Good' | 'Okay' | 'Tough' | ''
export type Progress = 'On Track' | 'Minor Adjustment' | 'Review Required' | ''

export interface Profile {
  id: string
  name: string
  email: string
  role: Role | null
  department: string | null  // team
  position: string | null    // 직책
  mentor_id: string | null
  status: ProfileStatus
  is_admin: boolean
  created_at: string
}

export interface InterviewReport {
  id: string
  mentor_id: string
  intern_id: string
  interview_date: string | null
  content: string | null
  suggestions: string | null
  action_items: string | null
  other: string | null
  status: 'draft' | 'submitted'
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  intern_id: string
  week_number: number
  topic: string | null
  learned: string | null
  rating: Rating | null
  feeling: string | null
  questions: string | null
  status: ReportStatus
  submitted_at: string | null
  mentor_good: string | null
  mentor_next: string | null
  mentor_qa: string | null
  mentor_progress: Progress | null
  mentor_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}
