import { ActivityEvent } from '@/src/types';
import { formatDateTime } from '@/src/utils/formatters';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface TimelineProps {
  events: ActivityEvent[];
  emptyMessage?: string;
}

export function Timeline({ events, emptyMessage = 'No activity recorded yet.' }: TimelineProps) {
  if (events.length === 0) {
    return <p className="py-4 text-sm text-[#64748B]">{emptyMessage}</p>;
  }

  return (
    <ol className="relative space-y-5 border-l border-[#E2E8F0] pl-5 ml-2">
      {events.map((event) => {
        const Icon =
          event.category === 'approval'
            ? CheckCircle2
            : event.category === 'payment'
              ? CreditCard
              : event.category === 'revision'
                ? RotateCcw
                : event.category === 'dispute'
                  ? AlertTriangle
                  : event.category === 'agreement'
                    ? FileCheck
                    : FileText;

        const iconTone =
          event.category === 'approval'
            ? 'text-[#16A34A] bg-emerald-50 border-emerald-200'
            : event.category === 'dispute'
              ? 'text-[#DC2626] bg-red-50 border-red-200'
              : event.category === 'revision'
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-[#2563EB] bg-blue-50 border-blue-200';

        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[30px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${iconTone}`}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-[#0F172A]">{event.action}</p>
              <time className="font-mono text-xs text-[#64748B] tabular-nums">
                {formatDateTime(event.timestamp)}
              </time>
            </div>
            <p className="mt-0.5 text-xs text-[#64748B]">
              {event.actorName} · {event.projectTitle}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{event.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}
