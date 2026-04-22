'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Profile, Report, Rating } from '@/types'
import { getWeekInfo, getCurrentWeek, TOTAL_WEEKS } from '@/lib/weeks'
import StatusBadge from './StatusBadge'
import { saveReport, submitReport, recallReport } from '@/app/intern/actions'

const RATINGS: Rating[] = ['Excellent', 'Good', 'Okay', 'Tough']

export default function ReportForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialWeek = Number(searchParams.get('week')) || getCurrentWeek()

  const [week, setWeek] = useState(initialWeek)
  const [report, setReport] = useState<Report | null>(null)
  const [topic, setTopic] = useState('')
  const [learned, setLearned] = useState('')
  const [rating, setRating] = useState<Rating>('')
  const [feeling, setFeeling] = useState('')
  const [questions, setQuestions] = useState('')
  const [saveHint, setSaveHint] = useState('')
  const [saveError, setSaveError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [recalling, setRecalling] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 읽기는 브라우저 클라이언트 사용 (RLS SELECT 허용)
  const loadWeek = useCallback(async (w: number) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('intern_id', profile.id)
      .eq('week_number', w)
      .maybeSingle()

    setReport(data)
    setTopic(data?.topic ?? '')
    setLearned(data?.learned ?? '')
    setRating((data?.rating as Rating) ?? '')
    setFeeling(data?.feeling ?? '')
    setQuestions(data?.questions ?? '')
    setSubmitted(false)
    setSaveError('')
  }, [profile.id])

  useEffect(() => { loadWeek(week) }, [week, loadWeek])

  function changeWeek(dir: number) {
    const next = Math.max(1, Math.min(TOTAL_WEEKS, week + dir))
    if (next !== week) {
      setWeek(next)
      router.replace(`/intern?week=${next}`)
    }
  }

  // 자동저장 — Server Action 사용 (RLS 우회)
  const autoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveHint('Saving…')
    setSaveError('')
    saveTimer.current = setTimeout(async () => {
      const result = await saveReport({ weekNumber: week, topic, learned, rating, feeling, questions })
      if ('error' in result && result.error) {
        // submitted/completed 상태의 자동저장 실패는 무시 (정상 동작)
        if (!result.error.includes('overwrite')) {
          setSaveError(result.error)
        }
        setSaveHint('')
      } else {
        if (result.data) setReport(result.data as Report)
        setSaveHint('Saved ✓')
        setTimeout(() => setSaveHint(''), 1500)
      }
    }, 600)
  }, [week, topic, learned, rating, feeling, questions])

  // 제출 — Server Action 사용
  async function handleSubmit() {
    setSubmitting(true)
    setSaveError('')
    const result = await submitReport({ weekNumber: week, topic, learned, rating, feeling, questions })
    if ('error' in result && result.error) {
      setSaveError(result.error)
    } else {
      if (result.data) setReport(result.data as Report)
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  // 회수 — Server Action 사용
  async function handleRecall() {
    if (!confirm('제출을 취소하고 레포트를 수정하시겠습니까?')) return
    setRecalling(true)
    setSaveError('')
    const result = await recallReport(week)
    if ('error' in result && result.error) {
      setSaveError(result.error)
    } else {
      if (result.data) setReport(result.data as Report)
      setSubmitted(false)
    }
    setRecalling(false)
  }

  const isSubmitted = report?.status === 'submitted' || report?.status === 'completed'
  const isCompleted = report?.status === 'completed'
  const locked = isSubmitted

  return (
    <>
      {/* Week Bar */}
      <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #E8EDF3', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => changeWeek(-1)} style={{ width: 28, height: 28, border: '1.5px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ minWidth: 86, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79' }}>Week {week}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{getWeekInfo(week)}</div>
          </div>
          <button onClick={() => changeWeek(1)} style={{ width: 28, height: 28, border: '1.5px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
        <input
          value={topic}
          onChange={e => { setTopic(e.target.value); if (!locked) autoSave() }}
          disabled={locked}
          placeholder="Topic this week (e.g. Onboarding & Fundamentals)"
          style={{ flex: 1, border: '1.5px solid #E8EDF3', borderRadius: 8, padding: '8px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
        />
        <span style={{ fontSize: 12, color: saveError ? '#C55A11' : '#aaa' }}>{saveHint}</span>
        <StatusBadge status={report?.status || 'draft'} />
      </div>

      {/* Form */}
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 20px 80px' }}>

        {/* S01 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="sec-num" style={{ background: '#1F4E79' }}>01</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>What I Learned This Week</span>
          </div>
          <div className="field-hint">Key takeaways, processes observed, skills practiced, or concepts understood.</div>
          <textarea rows={7} value={learned} onChange={e => { setLearned(e.target.value); if (!locked) autoSave() }} disabled={locked} placeholder="Write freely about what you learned this week…" />
        </div>

        {/* S02 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="sec-num" style={{ background: '#1F4E79' }}>02</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>How Was This Week</span>
          </div>
          <div className="field-label">Overall</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {RATINGS.map(r => (
              <button
                key={r}
                disabled={locked}
                className={`pill${rating === r ? ' selected-navy' : ''}`}
                onClick={() => { if (!locked) { setRating(rating === r ? '' : r); autoSave() } }}
              >{r}</button>
            ))}
          </div>
          <div className="field-hint">Overall impression, pace of work, memorable moments, or anything on your mind.</div>
          <textarea rows={5} value={feeling} onChange={e => { setFeeling(e.target.value); if (!locked) autoSave() }} disabled={locked} placeholder="How did this week feel? Any highs or lows?" />
        </div>

        {/* S03 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="sec-num" style={{ background: '#C55A11' }}>03</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#C55A11' }}>Questions &amp; What I Want to Know More</span>
          </div>
          <div className="field-hint">Anything unclear, questions for the mentor or manager, topics to explore further.</div>
          <textarea rows={6} value={questions} onChange={e => { setQuestions(e.target.value); if (!locked) autoSave() }} disabled={locked} placeholder="Write your questions or curiosities here…" />
        </div>

        {/* 제출 성공 배너 */}
        {isSubmitted && submitted && (
          <div style={{ background: '#E2EFDA', border: '1px solid #A9D18E', borderRadius: 10, padding: '16px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, color: '#375623', fontSize: 15 }}>Report Submitted!</div>
              <div style={{ fontSize: 13, color: '#375623', marginTop: 2 }}>멘토의 피드백을 기다려 주세요.</div>
            </div>
          </div>
        )}

        {/* Submit 버튼 (draft 상태일 때만) */}
        {!isSubmitted && (
          <div className="no-print" style={{ textAlign: 'center', marginBottom: 16 }}>
            {saveError && (
              <div style={{ color: '#C55A11', fontSize: 13, marginBottom: 10, background: '#FFF3EE', border: '1px solid #FCE4D6', borderRadius: 8, padding: '10px 16px' }}>
                ⚠ {saveError}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ background: '#1F4E79', color: '#fff', border: 'none', padding: '13px 40px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(31,78,121,.35)', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Submitting…' : 'Submit Report →'}
            </button>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Drafts are auto-saved</div>
          </div>
        )}

        {/* Recall 버튼 (submitted 상태 + 멘토 미완료 시) */}
        {isSubmitted && !isCompleted && (
          <div className="no-print" style={{ textAlign: 'center', marginBottom: 16 }}>
            {saveError && (
              <div style={{ color: '#C55A11', fontSize: 13, marginBottom: 10, background: '#FFF3EE', border: '1px solid #FCE4D6', borderRadius: 8, padding: '10px 16px' }}>
                ⚠ {saveError}
              </div>
            )}
            <button
              onClick={handleRecall}
              disabled={recalling}
              style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: recalling ? 'default' : 'pointer', fontFamily: 'inherit' }}
            >
              {recalling ? 'Recalling…' : '↩ Recall & Edit'}
            </button>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>멘토 피드백 완료 후에는 회수할 수 없습니다</div>
          </div>
        )}

        {/* S04 Mentor Feedback — 인턴에게는 읽기 전용 */}
        {isSubmitted && (
          <div className="card mentor-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="sec-num" style={{ background: '#595959' }}>04</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#595959' }}>Mentor Feedback</span>
            </div>
            {!isCompleted && (
              <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', marginBottom: 14 }}>
                Awaiting mentor review…
              </div>
            )}
            <div className="mentor-table">
              <div className="mentor-row">
                <div className="mentor-label">This week<br />good at</div>
                <div className="mentor-input-wrap">
                  <textarea rows={3} value={report?.mentor_good ?? ''} disabled placeholder="" />
                </div>
              </div>
              <div className="mentor-row">
                <div className="mentor-label">Next week<br />focus</div>
                <div className="mentor-input-wrap">
                  <textarea rows={3} value={report?.mentor_next ?? ''} disabled placeholder="" />
                </div>
              </div>
              <div className="mentor-row">
                <div className="mentor-label">Q&amp;A<br />summary</div>
                <div className="mentor-input-wrap">
                  <textarea rows={3} value={report?.mentor_qa ?? ''} disabled placeholder="" />
                </div>
              </div>
              <div className="mentor-row">
                <div className="mentor-label">Progress<br />status</div>
                <div className="mentor-input-wrap" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
                  {report?.mentor_progress
                    ? <span className="pill selected-gray">{report.mentor_progress}</span>
                    : <span style={{ color: '#aaa', fontSize: 13 }}>—</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print */}
        {isCompleted && report && (
          <div className="no-print" style={{ textAlign: 'center', marginTop: 8 }}>
            <a
              href={`/report/${report.id}/print`}
              target="_blank"
              style={{ background: 'none', border: '1.5px solid #ddd', color: '#888', padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
            >
              🖨&nbsp; Print / Save as PDF
            </a>
          </div>
        )}
      </div>
    </>
  )
}
