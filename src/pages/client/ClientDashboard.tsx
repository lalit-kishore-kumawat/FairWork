import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Clock,
  DollarSign,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { MetricCard } from '@/src/components/dashboard/MetricCard';
import { ProjectProgressChart } from '@/src/components/dashboard/ProjectProgressChart';
import { ProjectCard } from '@/src/components/projects/ProjectCard';
import { CreateProjectModal } from '@/src/components/projects/CreateProjectModal';
import { Timeline } from '@/src/components/common/Timeline';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { formatCurrency, formatDate, isDateOverdue } from '@/src/utils/formatters';

export function ClientDashboard() {
  const { currentUser } = useAuth();
  const { projects, milestones, submissions, disputes, activities } = useAppData();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const clientProjects = projects.filter(
    (p) => p.clientId === currentUser?.id || currentUser?.id === 'usr-client-1'
  );
  const projectIds = new Set(clientProjects.map((p) => p.id));

  const activeProjects = clientProjects.filter(
    (p) => p.status === 'Active' || p.status === 'In Review'
  );
  const pendingSubmissions = submissions.filter(
    (s) => projectIds.has(s.projectId) && s.decision === 'Pending Review'
  );
  const totalBudget = clientProjects
    .filter((p) => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + p.budget, 0);

  const overdueMilestones = milestones.filter(
    (m) =>
      projectIds.has(m.projectId) &&
      isDateOverdue(m.dueDate) &&
      !['Approved', 'Payment Pending', 'Paid'].includes(m.status)
  );
  const awaitingAcceptance = clientProjects.filter((p) => p.status === 'Awaiting Acceptance');
  const openDisputes = disputes.filter(
    (d) =>
      projectIds.has(d.projectId) &&
      (d.status === 'Open' || d.status === 'Under Review')
  );

  const recentActivities = activities
    .filter((a) => projectIds.has(a.projectId))
    .slice(0, 6);

  return (
    <DashboardLayout
      title={`Welcome back, ${currentUser?.name.split(' ')[0] || 'Client'}`}
      breadcrumb="Client Dashboard · Overview"
      primaryAction={
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>+ Create New Project</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Projects"
            value={clientProjects.length}
            helper="Across all agreement stages"
            icon={<FolderKanban className="h-4 w-4" />}
            tone="neutral"
          />
          <MetricCard
            label="Active Projects"
            value={activeProjects.length}
            helper="Currently in execution or review"
            icon={<Clock className="h-4 w-4" />}
            tone="primary"
          />
          <MetricCard
            label="Pending Approvals"
            value={pendingSubmissions.length}
            helper="Deliverables awaiting sign-off"
            icon={<CheckSquare className="h-4 w-4" />}
            tone="warning"
          />
          <MetricCard
            label="Total Project Budget"
            value={formatCurrency(totalBudget)}
            helper="Structured milestone allocations"
            icon={<DollarSign className="h-4 w-4" />}
            tone="success"
          />
        </section>

        {/* Main Workspace Split: Progress Chart & Pending Actions */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 lg:col-span-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-[#0F172A]">
                  Project Progress Overview
                </h2>
                <p className="text-xs text-[#64748B]">
                  Milestone completion percentage across active agreements
                </p>
              </div>
              <Link
                to="/client/projects"
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                All Projects
              </Link>
            </div>
            <ProjectProgressChart projects={clientProjects} milestones={milestones} />
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 lg:col-span-5">
            <h2 className="font-display text-base font-semibold text-[#0F172A]">
              Pending Actions
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Items requiring client review or follow-up
            </p>

            <div className="mt-4 divide-y divide-[#E2E8F0]">
              {pendingSubmissions.map((sub) => {
                const proj = projects.find((p) => p.id === sub.projectId);
                return (
                  <Link
                    key={sub.id}
                    to={`/projects/${sub.projectId}/deliverables`}
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-slate-50/70"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#0F172A] truncate">
                        Approve deliverable · {proj?.title}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Submitted by {sub.submittedByName}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs font-semibold text-[#2563EB]">
                      Review
                    </span>
                  </Link>
                );
              })}

              {overdueMilestones.map((ms) => (
                <Link
                  key={ms.id}
                  to={`/projects/${ms.projectId}/milestones`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#DC2626] truncate">
                      Overdue milestone · {ms.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Due {formatDate(ms.dueDate)}
                    </p>
                  </div>
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                </Link>
              ))}

              {awaitingAcceptance.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F172A] truncate">
                      Pending freelancer acceptance · {proj.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Invited {proj.freelancerName}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-medium text-amber-700">
                    Awaiting
                  </span>
                </Link>
              ))}

              {openDisputes.map((dsp) => (
                <Link
                  key={dsp.id}
                  to="/disputes"
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F172A] truncate">
                      Open dispute {dsp.id} · {dsp.projectName}
                    </p>
                    <p className="text-xs text-[#64748B]">{dsp.category}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold text-[#DC2626]">
                    {dsp.status}
                  </span>
                </Link>
              ))}

              {pendingSubmissions.length === 0 &&
                overdueMilestones.length === 0 &&
                awaitingAcceptance.length === 0 &&
                openDisputes.length === 0 && (
                  <p className="py-6 text-sm text-[#64748B]">
                    All milestones and agreements are currently up to date.
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* Recent Projects + Activity Timeline */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Recent Projects
              </h2>
              <Link
                to="/client/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {clientProjects.length === 0 ? (
              <EmptyState
                title="No projects created yet"
                description="Create your first structured milestone agreement to track deliverables and accountability."
                action={
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
                  >
                    + Create New Project
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {clientProjects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    milestones={milestones.filter((m) => m.projectId === project.id)}
                    counterpartyLabel="Freelancer"
                    counterpartyName={project.freelancerName}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 lg:col-span-5">
            <h2 className="mb-4 font-display text-base font-semibold text-[#0F172A]">
              Activity Timeline
            </h2>
            <Timeline events={recentActivities} />
          </div>
        </section>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/projects/${id}`)}
      />
    </DashboardLayout>
  );
}
