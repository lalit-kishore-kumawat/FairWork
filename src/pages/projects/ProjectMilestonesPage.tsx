import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Edit3, Eye, FileUp, Plus } from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { MilestoneCard } from '@/src/components/milestones/MilestoneCard';
import { MilestoneFormModal } from '@/src/components/milestones/MilestoneFormModal';
import { MilestoneDetailModal } from '@/src/components/milestones/MilestoneDetailModal';
import { FilterDropdown } from '@/src/components/common/FilterDropdown';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { Milestone, MilestoneStatus } from '@/src/types';

const MILESTONE_STATUSES: Array<'All' | MilestoneStatus> = [
  'All',
  'Not Started',
  'In Progress',
  'Submitted',
  'Revision Requested',
  'Approved',
  'Payment Pending',
  'Paid',
  'Disputed',
];

export function ProjectMilestonesPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const {
    projects,
    milestones,
    submissions,
    createMilestone,
    updateMilestone,
    approveDeliverable,
    requestDeliverableRevision,
  } = useAppData();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'All' | MilestoneStatus>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [detailMilestone, setDetailMilestone] = useState<Milestone | null>(null);

  const project = id ? projects.find((p) => p.id === id) : null;
  const isFreelancer = currentUser?.role === 'freelancer';

  const scopedMilestones = (
    project
      ? milestones.filter((m) => m.projectId === project.id)
      : milestones.filter((m) => {
          const p = projects.find((pr) => pr.id === m.projectId);
          if (!p) return false;
          return isFreelancer
            ? p.freelancerId === currentUser?.id || currentUser?.id === 'usr-freelancer-1'
            : p.clientId === currentUser?.id || currentUser?.id === 'usr-client-1';
        })
  ).filter((m) => statusFilter === 'All' || m.status === statusFilter);

  const detailProject = detailMilestone
    ? projects.find((p) => p.id === detailMilestone.projectId) || null
    : null;

  return (
    <DashboardLayout
      title={project ? `${project.title} · Milestones` : 'All Milestones'}
      breadcrumb={project ? `Projects / ${project.title} / Milestones` : 'Workspace · Milestones'}
      primaryAction={
        project && !isFreelancer ? (
          <button
            type="button"
            onClick={() => {
              setEditingMilestone(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Milestone</span>
          </button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {project && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Link
              to={`/projects/${project.id}`}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              Overview &amp; Agreement
            </Link>
            <Link
              to={`/projects/${project.id}/milestones`}
              className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white"
            >
              Milestones
            </Link>
            <Link
              to={`/projects/${project.id}/deliverables`}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              Deliverables &amp; Submissions
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-sm font-medium text-[#0F172A]">
            Showing <span className="font-mono tabular-nums">{scopedMilestones.length}</span>{' '}
            milestone(s)
          </p>
          <FilterDropdown
            label="Milestone Status"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'All' | MilestoneStatus)}
            options={MILESTONE_STATUSES.map((s) => ({ label: s, value: s }))}
          />
        </div>

        {scopedMilestones.length === 0 ? (
          <EmptyState
            title="No milestones match this filter"
            description="Adjust the status filter or add a new milestone to this agreement."
          />
        ) : (
          <div className="space-y-4">
            {scopedMilestones.map((ms) => {
              const msProject = projects.find((p) => p.id === ms.projectId);
              return (
                <MilestoneCard
                  key={ms.id}
                  milestone={ms}
                  onClick={() => setDetailMilestone(ms)}
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => setDetailMilestone(ms)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </button>

                      {!isFreelancer &&
                        ['Not Started', 'In Progress'].includes(ms.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMilestone(ms);
                              setFormOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                        )}

                      {isFreelancer &&
                        ['Not Started', 'In Progress', 'Revision Requested'].includes(
                          ms.status
                        ) &&
                        msProject && (
                          <Link
                            to={`/projects/${msProject.id}/deliverables`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                          >
                            <FileUp className="h-3.5 w-3.5" />
                            <span>Submit Deliverable</span>
                          </Link>
                        )}

                      {!isFreelancer && ms.status === 'Submitted' && (
                        <button
                          type="button"
                          onClick={() => setDetailMilestone(ms)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Review &amp; Approve</span>
                        </button>
                      )}
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {project && (
        <MilestoneFormModal
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingMilestone(null);
          }}
          existingMilestone={editingMilestone}
          onSave={(data) => {
            if (editingMilestone) {
              updateMilestone(editingMilestone.id, data);
              addToast({
                variant: 'success',
                title: 'Milestone updated',
                description: data.title,
              });
            } else {
              createMilestone({
                projectId: project.id,
                ...data,
              });
              addToast({
                variant: 'success',
                title: 'Milestone added',
                description: `${data.title} appended to agreement.`,
              });
            }
          }}
        />
      )}

      <MilestoneDetailModal
        open={Boolean(detailMilestone)}
        onClose={() => setDetailMilestone(null)}
        milestone={detailMilestone}
        project={detailProject}
        submissions={
          detailMilestone
            ? submissions.filter((s) => s.milestoneId === detailMilestone.id)
            : []
        }
        userRole={currentUser?.role || 'client'}
        onApprove={(submissionId, feedback) => {
          if (!detailMilestone || !detailProject || !currentUser) return;
          approveDeliverable({
            submissionId,
            milestoneId: detailMilestone.id,
            project: detailProject,
            client: currentUser,
            feedback,
          });
          addToast({
            variant: 'success',
            title: 'Milestone approved',
            description: 'Deliverable verified and milestone marked Payment Pending.',
          });
          setDetailMilestone(null);
        }}
        onRequestRevision={(submissionId, reason) => {
          if (!detailMilestone || !detailProject || !currentUser) return;
          requestDeliverableRevision({
            submissionId,
            milestoneId: detailMilestone.id,
            project: detailProject,
            client: currentUser,
            reason,
          });
          addToast({
            variant: 'warning',
            title: 'Revision requested',
            description: 'Written feedback recorded for the freelancer.',
          });
          setDetailMilestone(null);
        }}
      />
    </DashboardLayout>
  );
}
