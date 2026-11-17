import { Milestone } from '@/src/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyExact(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getRelativeDaysLabel(dateStr: string): string {
  const target = new Date(dateStr).getTime();
  const now = new Date('2026-11-17T10:00:00Z').getTime();
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays > 1) return `${diffDays} days left`;
  const overdue = Math.abs(diffDays);
  return `${overdue} day${overdue === 1 ? '' : 's'} overdue`;
}

export function isDateOverdue(dateStr: string): boolean {
  const target = new Date(dateStr).getTime();
  const now = new Date('2026-11-17T10:00:00Z').getTime();
  return target < now;
}

export function calculateProjectCompletion(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const totalProgress = milestones.reduce((acc, m) => {
    if (m.status === 'Approved' || m.status === 'Payment Pending' || m.status === 'Paid') {
      return acc + 100;
    }
    return acc + m.progress;
  }, 0);
  return Math.round(totalProgress / milestones.length);
}
