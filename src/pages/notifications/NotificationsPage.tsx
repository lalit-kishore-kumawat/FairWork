import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Mail,
  RotateCcw,
} from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { FilterDropdown } from '@/src/components/common/FilterDropdown';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { NotificationType } from '@/src/types';
import { formatDateTime } from '@/src/utils/formatters';

export function NotificationsPage() {
  const { currentUser } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const { addToast } = useToast();

  const [typeFilter, setTypeFilter] = useState<'all' | NotificationType>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');

  const userNotifications = useMemo(() => {
    return notifications
      .filter((n) => n.userId === currentUser?.id)
      .filter((n) => (typeFilter === 'all' ? true : n.type === typeFilter))
      .filter((n) => (readFilter === 'unread' ? !n.read : true));
  }, [notifications, currentUser, typeFilter, readFilter]);

  const unreadCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.read
  ).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'invitation':
      case 'project_accepted':
        return <Mail className="h-4 w-4 text-[#2563EB]" />;
      case 'milestone_submitted':
        return <FileText className="h-4 w-4 text-[#2563EB]" />;
      case 'revision_requested':
        return <RotateCcw className="h-4 w-4 text-[#F59E0B]" />;
      case 'deliverable_approved':
        return <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />;
      case 'payment_updated':
        return <CreditCard className="h-4 w-4 text-[#16A34A]" />;
      case 'deadline_approaching':
        return <Clock className="h-4 w-4 text-[#F59E0B]" />;
      case 'inactivity_detected':
      case 'dispute':
        return <AlertTriangle className="h-4 w-4 text-[#DC2626]" />;
      default:
        return <Bell className="h-4 w-4 text-[#64748B]" />;
    }
  };

  return (
    <DashboardLayout
      title="Notification Centre"
      breadcrumb={`Workspace · Notifications (${unreadCount} unread)`}
      primaryAction={
        unreadCount > 0 && currentUser ? (
          <button
            type="button"
            onClick={() => {
              markAllNotificationsRead(currentUser.id);
              addToast({
                variant: 'success',
                title: 'All notifications marked as read',
              });
            }}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            <CheckCheck className="h-4 w-4 text-[#16A34A]" />
            <span>Mark All as Read</span>
          </button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setReadFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                readFilter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Alerts
            </button>
            <button
              type="button"
              onClick={() => setReadFilter('unread')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                readFilter === 'unread'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <FilterDropdown
            label="Type"
            value={typeFilter}
            onChange={(val) => setTypeFilter(val as 'all' | NotificationType)}
            options={[
              { label: 'All Types', value: 'all' },
              { label: 'Project Invitations', value: 'invitation' },
              { label: 'Milestone Submitted', value: 'milestone_submitted' },
              { label: 'Deliverable Approved', value: 'deliverable_approved' },
              { label: 'Revision Requested', value: 'revision_requested' },
              { label: 'Deadline Approaching', value: 'deadline_approaching' },
              { label: 'Inactivity Detected', value: 'inactivity_detected' },
              { label: 'Disputes', value: 'dispute' },
            ]}
          />
        </div>

        {userNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="You're all caught up"
            description="No notifications match the selected filter."
          />
        ) : (
          <div className="divide-y divide-[#E2E8F0] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
            {userNotifications.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center ${
                  item.read ? 'bg-white' : 'bg-blue-50/35'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                      {!item.read && (
                        <span className="rounded bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#64748B]">{item.message}</p>
                    <p className="mt-1.5 font-mono text-xs text-[#64748B] tabular-nums">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(item.id)}
                      className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-50"
                    >
                      Mark as Read
                    </button>
                  )}
                  <Link
                    to={item.link}
                    onClick={() => markNotificationRead(item.id)}
                    className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
