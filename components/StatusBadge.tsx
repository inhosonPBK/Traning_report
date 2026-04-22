import { ReportStatus } from '@/types'

const labels: Record<ReportStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  completed: '✓ Completed',
}

export default function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {labels[status]}
    </span>
  )
}
