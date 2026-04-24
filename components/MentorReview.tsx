'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Report, Progress } from '@/types'
import { saveMentorFeedback, completeMentorReview } from '@/app/mentor/actions'

const PROGRESS_OPTIONS: Progress[] = ['On Track', 'Minor Adjustment', 'Review Required']

export default function MentorReview({ report, mentorId }: { report: Report; mentorId: string }) {
  const router = useRouter()
  const [mentorGood, setMentorGood] = useState(report.mentor_good ?? '')
  const [mentorNext, setMentorNext] = useState(report.mentor_next ?? '')
  const [mentorQA, setMentorQA] = useState(report.mentor_qa ?? '')
  const [progress, setProgress] = useState<Progress>(report.mentor_progress ?? '')
  const [saveHint, setSaveHint] = useState('')
  const [saveError, setSaveError] = useState('')
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(report.status === 'completed')

  const isCompleted = completed || report.status === 'completed'

  // 포커스 벗어날 때 자동저장 — Server Action 사용
  async function autoSave() {
    setSaveHint('Saving…')
    setSaveError('')
    const result = await saveMentorFeedback({
      reportId: report.id,
      mentorGood,
      mentorNext,
      mentorQA,
      progress,
    })
    if ('error' in result && result.error) {
      setSaveError(result.error)
      setSaveHint('')
    } else {
      setSaveHint('Saved ✓')
      setTimeout(() => setSaveHint(''), 1500)
    }
  }

  // 리뷰 완료 — Server Action 사용
  async function handleComplete() {
    if (!progress) {
      setSaveError('Please select a progress status.')
      return
    }
    setCompleting(true)
    setSaveError('')
    const result = await completeMentorReview({
      reportId: report.id,
      mentorGood,
      mentorNext,
      mentorQA,
      progress,
    })
    if ('error' in result && result.error) {
      setSaveError(result.error)
      setCompleting(false)
    } else {
      setCompleted(true)
      setCompleting(false)
      // 멘토 목록으로 돌아가 Feedback given 상태 확인
      router.push('/mentor')
      router.refresh()
    }
  }

  return (
    <div className="card mentor-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div className="sec-num" style={{ background: '#595959' }}>04</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#595959' }}>Mentor Feedback</span>
        <span style={{ fontSize: 12, color: saveError ? '#C55A11' : '#aaa', marginLeft: 'auto' }}>{saveHint}</span>
      </div>
      <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', marginBottom: 14 }}>
        {isCompleted ? 'Review completed.' : 'Complete feedback and click "Complete Review" to finalize.'}
      </div>

      <div className="mentor-table">
        <div className="mentor-row">
          <div className="mentor-label">This week<br />good at</div>
          <div className="mentor-input-wrap">
            <textarea
              rows={3}
              value={mentorGood}
              disabled={isCompleted}
              onChange={e => setMentorGood(e.target.value)}
              onBlur={autoSave}
              placeholder="What the intern did well this week…"
            />
          </div>
        </div>
        <div className="mentor-row">
          <div className="mentor-label">Next week<br />focus</div>
          <div className="mentor-input-wrap">
            <textarea
              rows={3}
              value={mentorNext}
              disabled={isCompleted}
              onChange={e => setMentorNext(e.target.value)}
              onBlur={autoSave}
              placeholder="Key points to focus on next week…"
            />
          </div>
        </div>
        <div className="mentor-row">
          <div className="mentor-label">Q&amp;A<br />summary</div>
          <div className="mentor-input-wrap">
            <textarea
              rows={3}
              value={mentorQA}
              disabled={isCompleted}
              onChange={e => setMentorQA(e.target.value)}
              onBlur={autoSave}
              placeholder="Summary of questions discussed…"
            />
          </div>
        </div>
        <div className="mentor-row">
          <div className="mentor-label">Progress<br />status</div>
          <div className="mentor-input-wrap" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8, flexWrap: 'wrap' }}>
            {PROGRESS_OPTIONS.map(p => (
              <button
                key={p}
                disabled={isCompleted}
                className={`pill${progress === p ? ' selected-gray' : ''}`}
                onClick={() => { if (!isCompleted) setProgress(progress === p ? '' : p) }}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      {!isCompleted && (
        <div className="no-print" style={{ textAlign: 'center', marginTop: 20 }}>
          {saveError && (
            <div style={{ color: '#C55A11', fontSize: 13, marginBottom: 12, background: '#FFF3EE', border: '1px solid #FCE4D6', borderRadius: 8, padding: '10px 16px' }}>
              ⚠ {saveError}
            </div>
          )}
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{ background: '#375623', color: '#fff', border: 'none', padding: '13px 40px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: completing ? 'default' : 'pointer', fontFamily: 'inherit', opacity: completing ? 0.7 : 1 }}
          >
            {completing ? 'Completing…' : '✓ Complete Review'}
          </button>
        </div>
      )}
    </div>
  )
}
