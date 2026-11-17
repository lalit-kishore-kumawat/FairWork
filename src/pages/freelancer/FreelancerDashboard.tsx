import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  FileUp,
  FolderKanban,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { MetricCard } from '@/src/components/dashboard/MetricCard';
import { ProjectCard } from '@/src/components/projects/ProjectCard';
import { Timeline } from '@/src/components/common/Timeline';
import { ConfirmDialog } from '@/src/components/common/ConfirmDialog';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import {
  formatCurrency,
  formatDate,
  getRelativeDaysLabel,
  isDateOverdue,
} from '@/src/utils/formatters';

export function FreelancerDashboard() {
  const { currentUser } = useAuth();
  const {
    projects,
    milestones,
    payments,
    activities,
    acceptProjectInvitation,
    declineProjectInvitation,
  } = useAppData();
  const { addToast } = useToast();

  const [confirmDeclineId, setConfirmDeclineId] = useState<string | null>(null);

  const myProjects = projects.filter(
    (p) =>
      p.freelancerId === currentUser?.id ||
      p.freelancerEmail.toLowerCase() === currentUser?.email.toLowerCase() ||
      currentUser?.id === 'usr-freelancer-1'
  );
  const myProjectIds = new Set(myProjects.map((p) => p.id));

  const activeProjects = myProjects.filter(
    (p) => p.status === 'Active' || p.status === 'In Review'
  );
  const completedProjects = myProjects.filter((p) => p.status === 'Completed');
  const invitations = myProjects.filter((p) => p.status === 'Awaiting Acceptance');

  const pendingDeliverables = milestones.filter(
    (m) =>
      myProjectIds.has(m.projectId) &&
      (m.status === 'In Progress' || m.status === 'Revision Requested' || m.status === 'Not Started')
  );

  const totalEarnings = payments
    .filter(
      (pay) =>
        (pay.freelancerId === currentUser?.id || currentUser?.id === 'usr-freelancer-1') &&
        pay.status === 'Successful'
    )
    .reduce((sum, pay) => sum + pay.amount, 0);

  const upcomingDeadlines = [...milestones]
    .filter(
      (m) =>
        myProjectIds.has(m.projectId) &&
        !['Approved', 'Payment Pending', 'Paid'].includes(m.status)
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const recentActivities = activities
    .filter((a) => myProjectIds.has(a.projectId))
    .slice(0, 6);

  const handleAccept = (projectId: string, title: string) => {
    if (!currentUser) return;
    acceptProjectInvitation(projectId, currentUser);
    addToast({
      variant: 'success',
      title: 'Project invitation accepted',
      description: `${title} is now Active. Milestone 1 is ready for delivery.`,
    });
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${currentUser?.name.split(' ')[0] || 'Freelancer'}`}
      breadcrumb="Freelancer Dashboard · Overview"
      primaryAction={
        <Link
          to="/freelancer/deliverables"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          <FileUp className="h-4 w-4" aria-hidden="true" />
          <span>Submit Deliverable</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active Projects"
            value={activeProjects.length}
            helper="In progress or under client review"
            icon={<FolderKanban className="h-4 w-4" />}
            tone="primary"
          />
          <MetricCard
            label="Completed Projects"
            value={completedProjects.length}
            helper="All milestones signed off"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="success"
          />
          <MetricCard
            label="Pending Deliverables"
            value={pendingDeliverables.length}
            helper="Upcoming or revision milestones"
            icon={<Clock className="h-4 w-4" />}
            tone="warning"
          />
          <MetricCard
            label="Total Earnings"
            value={formatCurrency(totalEarnings)}
            helper="Prototype verified ledger records"
            icon={<DollarSign className="h-4 w-4" />}
            tone="neutral"
          />
        </section>

        {/* Project Invitations */}
        <section
          id="invitations"
          className="rounded-xl border border-[#E2E8F0] bg-white p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Project Invitations ({invitations.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                Review structured milestone budgets and deadlines before accepting
              </p>
            </div>
          </div>

          {invitations.length === 0 ? (
            <p className="mt-4 text-sm text-[#64748B]">
              No pending project invitations right now.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-[#E2E8F0]">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col justify-between gap-4 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium text-[#64748B]">
                      Client: {inv.clientName} · {inv.category}
                    </p>
                    <Link
                      to={`/projects/${inv.id}`}
                      className="block font-display text-base font-semibold text-[#0F172A] hover:text-[#2563EB]"
                    >
                      {inv.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                      <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                        Budget: {formatCurrency(inv.budget)}
                      </span>
                      <span>Deadline: {formatDate(inv.deadline)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      to={`/projects/${inv.id}`}
                      className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-slate-50"
                    >
                      Review Agreement
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmDeclineId(inv.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(inv.id, inv.title)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Projects + Upcoming Deadlines */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Active Projects
              </h2>
              <Link
                to="/freelancer/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <EmptyState
                title="No active projects"
                description="Accept an incoming project invitation above to begin tracking milestones."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeProjects.map((project) => {
                  const pMilestones = milestones.filter((m) => m.projectId === project.id);
                  const nextMs = pMilestones.find(
                    (m) => !['Approved', 'Payment Pending', 'Paid'].includes(m.status)
                  );
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      milestones={pMilestones}
                      counterpartyLabel="Client"
                      counterpartyName={project.clientName}
                      nextMilestoneTitle={nextMs?.title}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Upcoming Deadlines
              </h2>
              <div className="mt-4 divide-y divide-[#E2E8F0]">
                {upcomingDeadlines.length === 0 ? (
                  <p className="py-4 text-sm text-[#64748B]">No upcoming milestone deadlines.</p>
                ) : (
                  upcomingDeadlines.map((ms) => {
                    const proj = projects.find((p) => p.id === ms.projectId);
                    const overdue = isDateOverdue(ms.dueDate);
                    return (
                      <Link
                        key={ms.id}
                        to={`/projects/${ms.projectId}/milestones`}
                        className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50/70"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#0F172A]">
                            {ms.title}
                          </p>
                          <p className="truncate text-xs text-[#64748B]">{proj?.title}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums ${
                              overdue ? 'text-[#DC2626]' : 'text-[#0F172A]'
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDate(ms.dueDate)}
                          </p>
                          <p className="text-[11px] text-[#64748B]">
                            {getRelativeDaysLabel(ms.dueDate)}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <h2 className="mb-4 font-display text-base font-semibold text-[#0F172A]">
                Recent Activity
              </h2>
              <Timeline events={recentActivities} />
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeclineId)}
        onClose={() => setConfirmDeclineId(null)}
        onConfirm={() => {
          if (confirmDeclineId && currentUser) {
            declineProjectInvitation(confirmDeclineId, currentUser);
            addToast({
              variant: 'info',
              title: 'Project invitation declined',
              description: 'The invitation has been marked as Cancelled.',
            });
          }
        }}
        title="Decline Project Invitation?"
        message="Declining this invitation will cancel the draft agreement and notify the client."
        confirmLabel="Decline Invitation"
        variant="danger"
      />
    </DashboardLayout>
  );
}
