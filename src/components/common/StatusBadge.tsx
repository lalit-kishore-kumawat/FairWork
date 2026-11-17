import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {
  AccountStatus,
  DisputeStatus,
  MilestoneStatus,
  PaymentStatus,
  ProjectStatus,
} from '@/src/types';

type AnyStatus =
  | ProjectStatus
  | MilestoneStatus
  | PaymentStatus
  | DisputeStatus
  | AccountStatus
  | 'Pending Review'
  | string;

interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  Icon: typeof Clock;
}

function getStatusConfig(status: AnyStatus): StatusConfig {
  switch (status) {
    case 'Active':
    case 'In Progress':
    case 'Processing':
    case 'Under Review':
      return {
        bg: 'bg-blue-50',
        text: 'text-[#1D4ED8]',
        border: 'border-blue-200',
        Icon: status === 'Processing' ? Loader2 : Clock,
      };
    case 'Completed':
    case 'Approved':
    case 'Paid':
    case 'Successful':
    case 'Resolved - Client Favored':
    case 'Resolved - Freelancer Favored':
    case 'Resolved - Split Settlement':
      return {
        bg: 'bg-emerald-50',
        text: 'text-[#16A34A]',
        border: 'border-emerald-200',
        Icon: CheckCircle2,
      };
    case 'Submitted':
    case 'In Review':
    case 'Pending Review':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        Icon: Eye,
      };
    case 'Awaiting Acceptance':
    case 'Payment Pending':
    case 'Pending':
    case 'Revision Requested':
    case 'Open':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        Icon: status === 'Revision Requested' ? RotateCcw : AlertTriangle,
      };
    case 'Disputed':
    case 'Failed':
    case 'Suspended':
      return {
        bg: 'bg-red-50',
        text: 'text-[#DC2626]',
        border: 'border-red-200',
        Icon: ShieldAlert,
      };
    case 'Cancelled':
    case 'Refunded':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        Icon: Ban,
      };
    case 'Draft':
    case 'Not Started':
    case 'Closed':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-[#64748B]',
        border: 'border-[#E2E8F0]',
        Icon: FileEdit,
      };
  }
}

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { bg, text, border, Icon } = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${bg} ${text} ${border} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
