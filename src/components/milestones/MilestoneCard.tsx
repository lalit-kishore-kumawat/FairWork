import { Calendar, CheckCircle2, FileText } from 'lucide-react';
import { Milestone } from '@/src/types';
import { formatCurrency, formatDate, getRelativeDaysLabel, isDateOverdue } from '@/src/utils/formatters';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ProgressBar } from '@/src/components/common/ProgressBar';

interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function MilestoneCard({ milestone, onClick, actions }: MilestoneCardProps) {
  const overdue =
    isDateOverdue(milestone.dueDate) &&
    !['Approved', 'Payment Pending', 'Paid'].includes(milestone.status);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-xl border border-[#E2E8F0] bg-white p-5 transition-colors ${
        onClick ? 'cursor-pointer hover:border-[#2563EB]/40 hover:bg-slate-50/40' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#64748B]">
            Milestone {milestone.order} · {milestone.deliverableLabel}
          </p>
          <h4 className="mt-1 font-display text-base font-semibold text-[#0F172A]">
            {milestone.title}
          </h4>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
            {formatCurrency(milestone.amount)}
          </span>
          <StatusBadge status={milestone.status} />
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{milestone.description}</p>

      {milestone.acceptanceCriteria.length > 0 && (
        <ul className="mt-3 space-y-1">
          {milestone.acceptanceCriteria.map((criterion, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-[#64748B]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 tabular-nums ${
              overdue ? 'font-semibold text-[#DC2626]' : 'text-[#64748B]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(milestone.dueDate)} ({getRelativeDaysLabel(milestone.dueDate)})
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#64748B]">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {milestone.deliverableLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:w-48">
          <ProgressBar value={milestone.progress} showPercentage />
        </div>
      </div>

      {actions && (
        <div
          className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#E2E8F0] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
