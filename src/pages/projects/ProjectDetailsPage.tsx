import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  FolderKanban,
  ShieldAlert,
} from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { Timeline } from '@/src/components/common/Timeline';
import { EmptyState } from '@/src/components/common/EmptyState';
import { MilestoneDetailModal } from '@/src/components/milestones/MilestoneDetailModal';
import { RaiseDisputeModal } from '@/src/components/disputes/RaiseDisputeModal';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { Milestone } from '@/src/types';
import {
  calculateProjectCompletion,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '@/src/utils/formatters';

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const {
    projects,
    milestones,
    submissions,
    activities,
    acceptProjectInvitation,
    confirmProjectAgreement,
    approveDeliverable,
    requestDeliverableRevision,
  } = useAppData();
  const { addToast } = useToast();

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found" breadcrumb="Projects / Missing">
        <EmptyState
          title="Project agreement not found"
          description="This project ID does not match an active or archived FairWork record."
          action={
            <Link
              to={currentUser?.role === 'freelancer' ? '/freelancer/projects' : '/client/projects'}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
            >
              Return to Projects
            </Link>
          }
        />
      </DashboardLayout>
    );
  }

  const projectMilestones = milestones
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => a.order - b.order);
  const projectActivities = activities.filter((a) => a.projectId === project.id);
  const completion = calculateProjectCompletion(projectMilestones);

  return (
    <DashboardLayout
      title={project.title}
      breadcrumb={`Projects / ${project.category}`}
      primaryAction={
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project.id}/milestones`}
            className="whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Manage Milestones
          </Link>
          <Link
            to={`/projects/${project.id}/deliverables`}
            className="whitespace-nowrap rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Deliverables
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Inactivity Warning Banner if flagged */}
        {project.inactivityAlert && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/70 px-5 py-3.5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Inactivity &amp; Deadline Alert
                </p>
                <p className="text-xs text-[#64748B]">{project.inactivityAlert}</p>
              </div>
            </div>
            <Link
              to="/disputes"
              className="whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
            >
              View Dispute Status
            </Link>
          </div>
        )}

        {/* Project Header Card */}
        <section className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#64748B]">
                Agreement ID: {project.id} · {project.category}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#0F172A]">
                {project.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={project.status} />
              <button
                type="button"
                onClick={() => setDisputeOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-red-50"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Raise Dispute</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#E2E8F0] py-4 sm:grid-cols-5">
            <div>
              <p className="text-xs text-[#64748B]">Client</p>
              <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">{project.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Freelancer</p>
              <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                {project.freelancerName}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Project Budget</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-[#0F172A] tabular-nums">
                {formatCurrency(project.budget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Start Date</p>
              <p className="mt-0.5 font-mono text-sm text-[#0F172A] tabular-nums">
                {formatDate(project.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Target Deadline</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
                {formatDate(project.deadline)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={completion} label="Overall Milestone Completion" />
          </div>
        </section>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <Link
            to={`/projects/${project.id}`}
            className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white"
          >
            Overview &amp; Agreement
          </Link>
          <Link
            to={`/projects/${project.id}/milestones`}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Milestones ({projectMilestones.length})
          </Link>
          <Link
            to={`/projects/${project.id}/deliverables`}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Deliverables &amp; Submissions
          </Link>
        </div>

        {/* Main 2-column content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {/* Project Description */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
              <h3 className="font-display text-base font-semibold text-[#0F172A]">
                Project Scope &amp; Objectives
              </h3>
              <p className="text-sm leading-relaxed text-[#64748B]">{project.scope}</p>

              <div>
                <h4 className="text-xs font-semibold text-[#0F172A]">Key Objectives</h4>
                <ul className="mt-2 space-y-1.5">
                  {project.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#64748B]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4">
                <h4 className="text-xs font-semibold text-[#0F172A]">Expected Deliverables</h4>
                <p className="mt-1 text-sm text-[#64748B]">{project.deliverablesSummary}</p>
              </div>
            </section>

            {/* Milestone Timeline */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-[#0F172A]">
                  Milestone Timeline
                </h3>
                <Link
                  to={`/projects/${project.id}/milestones`}
                  className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Open Milestone Manager
                </Link>
              </div>

              <div className="space-y-4">
                {projectMilestones.map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() => setSelectedMilestone(ms)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMilestone(ms);
                      }
                    }}
                    className="cursor-pointer rounded-xl border border-[#E2E8F0] p-4 transition-colors hover:border-[#2563EB]/50 hover:bg-slate-50/50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-[#64748B]">
                          Milestone {ms.order} · {ms.deliverableLabel}
                        </p>
                        <h4 className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                          {ms.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
                          {formatCurrency(ms.amount)}
                        </span>
                        <StatusBadge status={ms.status} />
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-[#64748B]">{ms.description}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] tabular-nums">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {formatDate(ms.dueDate)}
                      </span>
                      <div className="w-40">
                        <ProgressBar value={ms.progress} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-5">
            {/* Agreement Section */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-[#0F172A]">
                  <FileCheck className="h-4 w-4 text-[#2563EB]" />
                  <span>Structured Agreement</span>
                </h3>
                <StatusBadge
                  status={project.agreementConfirmed ? 'Approved' : 'Awaiting Acceptance'}
                />
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-medium text-[#64748B]">Agreed Scope</span>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#0F172A]">
                    {project.scope}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 border-y border-[#E2E8F0] py-3">
                  <div>
                    <span className="text-xs text-[#64748B]">Total Budget</span>
                    <p className="font-mono text-sm font-bold text-[#0F172A] tabular-nums">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B]">Final Deadline</span>
                    <p className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#64748B]">Revision Policy</span>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#0F172A]">
                    {project.revisionPolicy}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#64748B]">Confirmation Status</span>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {project.agreementConfirmed
                      ? `Confirmed by both parties on ${formatDateTime(
                          project.agreementConfirmedAt || project.startDate
                        )}`
                      : 'Pending mutual agreement confirmation before active milestone work.'}
                  </p>
                </div>
              </div>

              {!project.agreementConfirmed && currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser.role === 'freelancer') {
                      acceptProjectInvitation(project.id, currentUser);
                    } else {
                      confirmProjectAgreement(project.id, currentUser);
                    }
                    addToast({
                      variant: 'success',
                      title: 'Project agreement confirmed',
                      description: 'Project is now Active and milestones are unlocked.',
                    });
                  }}
                  className="w-full rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Confirm &amp; Activate Agreement
                </button>
              )}
            </section>

            {/* Documents & Files */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-[#0F172A]">
                <FolderKanban className="h-4 w-4 text-[#64748B]" />
                <span>Documents &amp; Files</span>
              </h3>
              {project.documents.length === 0 ? (
                <p className="mt-3 text-sm text-[#64748B]">
                  No reference documents uploaded yet.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[#E2E8F0]">
                  {project.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileText className="h-4 w-4 shrink-0 text-[#2563EB]" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#0F172A]">{doc.name}</p>
                          <p className="text-xs text-[#64748B]">
                            {doc.sizeLabel} · Uploaded by {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addToast({
                            variant: 'info',
                            title: `Downloading ${doc.name}`,
                            description: 'Document download simulated in prototype.',
                          })
                        }
                        aria-label={`Download ${doc.name}`}
                        className="rounded-lg border border-[#E2E8F0] p-2 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Project Activity Timeline */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <h3 className="mb-4 font-display text-base font-semibold text-[#0F172A]">
                Project Activity Timeline
              </h3>
              <Timeline events={projectActivities} />
            </section>
          </div>
        </div>
      </div>

      <MilestoneDetailModal
        open={Boolean(selectedMilestone)}
        onClose={() => setSelectedMilestone(null)}
        milestone={selectedMilestone}
        project={project}
        submissions={
          selectedMilestone
            ? submissions.filter((s) => s.milestoneId === selectedMilestone.id)
            : []
        }
        userRole={currentUser?.role || 'client'}
        onApprove={(submissionId, feedback) => {
          if (!selectedMilestone || !currentUser) return;
          approveDeliverable({
            submissionId,
            milestoneId: selectedMilestone.id,
            project,
            client: currentUser,
            feedback,
          });
          addToast({
            variant: 'success',
            title: 'Milestone approved',
            description: 'Payment ledger updated to Processing.',
          });
          setSelectedMilestone(null);
        }}
        onRequestRevision={(submissionId, reason) => {
          if (!selectedMilestone || !currentUser) return;
          requestDeliverableRevision({
            submissionId,
            milestoneId: selectedMilestone.id,
            project,
            client: currentUser,
            reason,
          });
          addToast({
            variant: 'warning',
            title: 'Revision requested',
            description: 'Freelancer has been notified with your feedback.',
          });
          setSelectedMilestone(null);
        }}
      />

      <RaiseDisputeModal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        defaultProjectId={project.id}
      />
    </DashboardLayout>
  );
}
