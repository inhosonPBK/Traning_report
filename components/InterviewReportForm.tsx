'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InterviewReport, Profile } from '@/types'
import { saveInterviewReport, submitInterviewReport } from '@/app/mentor/interview/actions'

export default function InterviewReportForm({
  intern,
  initialReport,
}: {
  intern: Profile
  initialReport?: InterviewReport | null
}) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [reportId, setReportId] = useState(initialReport?.id || '')
  const [interviewDate, setInterviewDate] = useState(initialReport?.interview_date?.split('T')[0] ?? today)
  const [content, setContent] = useState(initialReport?.content ?? '')
  const [suggestions, setSuggestions] = useState(initialReport?.suggestions ?? '')
  const [actionItems, setActionItems] = useState(initialReport?.action_items ?? '')
  const [other, setOther] = useState(initialReport?.other ?? '')
  const [saveHint, setSaveHint] = useState('')
  const [saveError, setSaveError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(initialReport?.status === 'submitted')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const locked = submitted

  const autoSave = useCallback(() => {
    if (locked) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveHint('Saving…')
    setSaveError('')
    saveTimer.current = setTimeout(async () => {
      const result = await saveInterviewReport({
        id: reportId || undefined,
        internId: intern.id,
        interviewDate,
        content,
        suggestions,
        actionItems,
        other,
      })
      if ('error' in result && result.error) {
        if (!result.error.includes('overwrite')) setSaveError(result.error)
        setSaveHint('')
      } else {
        if (result.data && !reportId) setReportId(result.data.id)
        setSaveHint('Saved ✓')
        setTimeout(() => setSaveHint(''), 1500)
      }
    }, 800)
  }, [reportId, intern.id, interviewDate, content, suggestions, actionItems, other, locked])

  async function handleSubmit() {
    setSubmitting(true)
    setSaveError('')
    const result = await submitInterviewReport({
      id: reportId || undefined,
      internId: intern.id,
      interviewDate,
      content,
      suggestions,
      actionItems,
      other,
    })
    if ('error' in result && result.error) {
      setSaveError(result.error)
    } else {
      if (result.data && !reportId) setReportId(result.data.id)
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  }

  return (
    <div>
      {/* 면담일 */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Interview Date</label>
        <input
          type="date"
          value={interviewDate}
          onChange={e => { setInterviewDate(e.target.value); if (!locked) autoSave() }}
          disabled={locked}
          style={{ border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '8px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
        />
        <span style={{ marginLeft: 12, fontSize: 12, color: saveError ? '#C55A11' : '#aaa' }}>{saveHint}</span>
      </div>

      {/* 면담내용 */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Content</label>
        <textarea
          rows={4}
          value={content}
          onChange={e => { setContent(e.target.value); if (!locked) autoSave() }}
          disabled={locked}
          placeholder="이번 면담에서 나눈 주요 내용을 작성하세요."
        />
      </div>

      {/* 건의 및 문의 */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Suggestions</label>
        <textarea
          rows={3}
          value={suggestions}
          onChange={e => { setSuggestions(e.target.value); if (!locked) autoSave() }}
          disabled={locked}
          placeholder="인턴이 제기한 건의사항이나 질문을 기록하세요."
        />
      </div>

      {/* 조치사항 */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Action Items</label>
        <textarea
          rows={3}
          value={actionItems}
          onChange={e => { setActionItems(e.target.value); if (!locked) autoSave() }}
          disabled={locked}
          placeholder="건의사항에 대한 조치 내용을 기록하세요."
        />
      </div>

      {/* 기타 */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Other</label>
        <textarea
          rows={2}
          value={other}
          onChange={e => { setOther(e.target.value); if (!locked) autoSave() }}
          disabled={locked}
          placeholder="기타 특이사항이 있으면 기록하세요."
        />
      </div>

      {/* 제출 완료 배너 */}
      {submitted && (
        <div style={{ background: '#E2EFDA', border: '1px solid #A9D18E', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: '#375623', fontSize: 14 }}>Interview report submitted</div>
            <div style={{ fontSize: 12, color: '#375623', marginTop: 2 }}>Your manager can now review this report.</div>
          </div>
        </div>
      )}

      {/* 에러 */}
      {saveError && (
        <div style={{ color: '#C55A11', fontSize: 13, marginBottom: 12, background: '#FFF3EE', border: '1px solid #FCE4D6', borderRadius: 8, padding: '10px 16px' }}>
          ⚠ {saveError}
        </div>
      )}

      {/* 버튼 */}
      {!locked && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '11px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Submitting…' : 'Submit →'}
          </button>
          <button
            onClick={() => router.push('/mentor/interview')}
            style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Back to List
          </button>
        </div>
      )}

      {locked && (
        <button
          onClick={() => router.push('/mentor/interview')}
          style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ← Back
        </button>
      )}
    </div>
  )
}
