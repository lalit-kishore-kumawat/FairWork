import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Send,
} from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import {
  FileUploadDropzone,
  UploadedFilePreview,
} from '@/src/components/common/FileUploadDropzone';
import { Modal } from '@/src/components/common/Modal';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { formatCurrency, formatDateTime } from '@/src/utils/formatters';

export function DeliverablesPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const {
    projects,
    milestones,
    submissions,
    submitDeliverable,
    approveDeliverable,
    requestDeliverableRevision,
  } = useAppData();
  const { addToast } = useToast();

  const isFreelancer = currentUser?.role === 'freelancer';
  const activeProjects = projects.filter((p) =>
    isFreelancer
      ? p.freelancerId === currentUser?.id || currentUser?.id === 'usr-freelancer-1'
      : p.clientId === currentUser?.id || currentUser?.id === 'usr-client-1'
  );

  const [manualProjectId, setManualProjectId] = useState<string>('');
  const selectedProject =
    (id ? projects.find((p) => p.id === id) : null) ||
    projects.find((p) => p.id === manualProjectId) ||
    activeProjects[0] ||
    null;

  const projectMilestones = selectedProject
    ? milestones.filter((m) => m.projectId === selectedProject.id)
    : [];

  const submittableMilestones = projectMilestones.filter((m) =>
    ['Not Started', 'In Progress', 'Revision Requested'].includes(m.status)
  );

  // Freelancer form state
  const [targetMilestoneId, setTargetMilestoneId] = useState(
    submittableMilestones[0]?.id || projectMilestones[0]?.id || ''
  );
  const [description, setDescription] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [files, setFiles] = useState<UploadedFilePreview[]>([]);
  const [screenshots, setScreenshots] = useState<UploadedFilePreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Client review state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<{
    submissionId: string;
    milestoneId: string;
    milestoneTitle: string;
  } | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('');

  const [revisionTarget, setRevisionTarget] = useState<{
    submissionId: string;
    milestoneId: string;
    milestoneTitle: string;
  } | null>(null);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionError, setRevisionError] = useState<string | null>(null);

  const projectSubmissions = selectedProject
    ? submissions.filter((s) => s.projectId === selectedProject.id)
    : [];

  const handleFreelancerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProject || !currentUser) return;
    const targetMs =
      projectMilestones.find((m) => m.id === targetMilestoneId) || submittableMilestones[0];
    if (!targetMs) {
      setFormError('Select a milestone to submit work against.');
      return;
    }
    if (description.trim().length < 15) {
      setFormError('Provide a deliverable summary of at least 15 characters.');
      return;
    }
    if (files.length === 0 && screenshots.length === 0) {
      setFormError('Attach at least one deliverable file or preview screenshot.');
      return;
    }

    submitDeliverable({
      milestone: targetMs,
      project: selectedProject,
      freelancer: currentUser,
      description: description.trim(),
      progressNotes: progressNotes.trim(),
      fileNames: files.map((f) => f.name),
      screenshotUrls: screenshots.map(
        (s) => s.previewUrl || '/src/assets/images/deliverable_preview_ui_1794911671129.jpg'
      ),
    });

    addToast({
      variant: 'success',
      title: 'Deliverable submitted for client review',
      description: `${targetMs.title} is now marked Submitted.`,
    });

    setDescription('');
    setProgressNotes('');
    setFiles([]);
    setScreenshots([]);
  };

  if (!selectedProject) {
    return (
      <DashboardLayout title="Deliverables" breadcrumb="Workspace · Deliverables">
        <EmptyState
          title="No projects available"
          description="Create or accept a project agreement before submitting or reviewing deliverables."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${selectedProject.title} · Deliverables`}
      breadcrumb={`Projects / ${selectedProject.title} / Deliverables`}
    >
      <div className="space-y-6">
        {!id && activeProjects.length > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
            <span className="text-sm font-medium text-[#0F172A]">Select Active Project</span>
            <select
              value={selectedProject.id}
              onChange={(e) => setManualProjectId(e.target.value)}
              aria-label="Select project"
              className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            >
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <Link
            to={`/projects/${selectedProject.id}`}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Overview &amp; Agreement
          </Link>
          <Link
            to={`/projects/${selectedProject.id}/milestones`}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Milestones
          </Link>
          <Link
            to={`/projects/${selectedProject.id}/deliverables`}
            className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white"
          >
            Deliverables &amp; Submissions
          </Link>
        </div>

        {/* Freelancer Submission Workspace */}
        {isFreelancer && (
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Submit Milestone Deliverable
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Upload source files, documentation, and visual previews tied to your milestone
              acceptance criteria.
            </p>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleFreelancerSubmit} className="mt-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Target Milestone
                </label>
                <select
                  value={targetMilestoneId}
                  onChange={(e) => setTargetMilestoneId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                >
                  {projectMilestones.map((ms) => (
                    <option key={ms.id} value={ms.id}>
                      M{ms.order}: {ms.title} ({ms.status}) — {formatCurrency(ms.amount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Submission Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the completed deliverables and how each acceptance criterion has been met..."
                  className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Progress Notes &amp; Testing Context
                </label>
                <input
                  type="text"
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Optional staging links, test results, or walkthrough instructions"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FileUploadDropzone
                  label="Deliverable Files"
                  files={files}
                  onChange={setFiles}
                />
                <FileUploadDropzone
                  label="Screenshots & Visual Previews"
                  accept="image/*"
                  files={screenshots}
                  onChange={setScreenshots}
                  helperText="Attach PNG or JPG screenshots of your work."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Deliverable for Review</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Submission History & Client Review Interface */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Deliverable Submission History ({projectSubmissions.length})
            </h2>
          </div>

          {projectSubmissions.length === 0 ? (
            <EmptyState
              title="No deliverables submitted yet"
              description="Once the freelancer uploads milestone deliverables, files and review controls will appear here."
            />
          ) : (
            <div className="space-y-4">
              {projectSubmissions.map((sub) => {
                const ms = milestones.find((m) => m.id === sub.milestoneId);
                return (
                  <article
                    key={sub.id}
                    className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[#64748B]">
                          Milestone {ms?.order || '—'} · Submitted by {sub.submittedByName} ·{' '}
                          <span className="font-mono tabular-nums">
                            {formatDateTime(sub.submittedAt)}
                          </span>
                        </p>
                        <h3 className="mt-1 font-display text-base font-semibold text-[#0F172A]">
                          {ms?.title || 'Deliverable Package'}
                        </h3>
                      </div>
                      <StatusBadge status={sub.decision} />
                    </div>

                    <p className="text-sm leading-relaxed text-[#0F172A]">{sub.description}</p>
                    {sub.progressNotes && (
                      <p className="text-xs text-[#64748B]">
                        <span className="font-semibold text-[#0F172A]">Progress Notes: </span>
                        {sub.progressNotes}
                      </p>
                    )}

                    {/* Files & Screenshots */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {sub.files.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#64748B]">Attached Files</p>
                          <div className="space-y-2">
                            {sub.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
                              >
                                <span className="flex items-center gap-2 font-medium text-[#0F172A] truncate">
                                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                                  <span className="truncate">{file.name}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addToast({
                                      variant: 'info',
                                      title: `Downloading ${file.name}`,
                                      description: `File (${file.sizeLabel}) download simulated.`,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:text-[#1D4ED8] shrink-0"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sub.screenshots.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#64748B]">
                            Screenshot Previews
                          </p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {sub.screenshots.map((shot) => (
                              <button
                                key={shot.id}
                                type="button"
                                onClick={() => setPreviewImageUrl(shot.previewUrl || null)}
                                className="group relative overflow-hidden rounded-lg border border-[#E2E8F0] text-left"
                              >
                                <img
                                  src={
                                    shot.previewUrl ||
                                    '/src/assets/images/deliverable_preview_ui_1794911671129.jpg'
                                  }
                                  alt={shot.name}
                                  referrerPolicy="no-referrer"
                                  className="h-28 w-full object-cover transition-transform group-hover:scale-[1.02]"
                                />
                                <span className="flex items-center justify-between bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A]">
                                  <span className="truncate">{shot.name}</span>
                                  <Eye className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Client feedback if already reviewed */}
                    {sub.clientFeedback && (
                      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#0F172A]">
                        <span className="font-semibold">
                          {sub.decision === 'Revision Requested'
                            ? 'Revision Reason: '
                            : 'Client Approval Comment: '}
                        </span>
                        <span className="text-[#64748B]">{sub.clientFeedback}</span>
                      </div>
                    )}

                    {/* Client Review Actions */}
                    {!isFreelancer && sub.decision === 'Pending Review' && (
                      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E2E8F0] pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setRevisionReason('');
                            setRevisionError(null);
                            setRevisionTarget({
                              submissionId: sub.id,
                              milestoneId: sub.milestoneId,
                              milestoneTitle: ms?.title || 'Milestone',
                            });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Request Revisions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setApprovalFeedback('');
                            setApproveTarget({
                              submissionId: sub.id,
                              milestoneId: sub.milestoneId,
                              milestoneTitle: ms?.title || 'Milestone',
                            });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve Deliverable</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* File Preview Modal */}
      <Modal
        open={Boolean(previewImageUrl)}
        onClose={() => setPreviewImageUrl(null)}
        title="Deliverable Screenshot Preview"
        maxWidth="2xl"
      >
        {previewImageUrl && (
          <img
            src={previewImageUrl}
            alt="Full deliverable preview"
            referrerPolicy="no-referrer"
            className="w-full rounded-lg border border-[#E2E8F0] object-contain"
          />
        )}
      </Modal>

      {/* Approve Confirmation Dialog with Optional Comment */}
      <Modal
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        title="Confirm Deliverable Approval"
        subtitle={approveTarget?.milestoneTitle}
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setApproveTarget(null)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!approveTarget || !currentUser) return;
                approveDeliverable({
                  submissionId: approveTarget.submissionId,
                  milestoneId: approveTarget.milestoneId,
                  project: selectedProject,
                  client: currentUser,
                  feedback: approvalFeedback.trim(),
                });
                addToast({
                  variant: 'success',
                  title: 'Deliverable approved',
                  description:
                    'Milestone marked Payment Pending in prototype ledger.',
                });
                setApproveTarget(null);
              }}
              className="rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Confirm Approval
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-[#64748B]">
            Approving this deliverable confirms the submission meets the milestone acceptance
            criteria and updates the prototype payment ledger to Processing.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0F172A]">
              Feedback Comment (Optional)
            </label>
            <textarea
              rows={2}
              value={approvalFeedback}
              onChange={(e) => setApprovalFeedback(e.target.value)}
              placeholder="Optional sign-off notes for the freelancer..."
              className="w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* Request Revision Modal Requiring Written Reason */}
      <Modal
        open={Boolean(revisionTarget)}
        onClose={() => setRevisionTarget(null)}
        title="Request Milestone Revisions"
        subtitle={revisionTarget?.milestoneTitle}
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRevisionTarget(null)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!revisionTarget || !currentUser) return;
                if (revisionReason.trim().length < 10) {
                  setRevisionError(
                    'A clear written reason (at least 10 characters) is required before requesting revisions.'
                  );
                  return;
                }
                requestDeliverableRevision({
                  submissionId: revisionTarget.submissionId,
                  milestoneId: revisionTarget.milestoneId,
                  project: selectedProject,
                  client: currentUser,
                  reason: revisionReason.trim(),
                });
                addToast({
                  variant: 'warning',
                  title: 'Revision request sent',
                  description: 'Freelancer notified with your written feedback.',
                });
                setRevisionTarget(null);
              }}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Submit Revision Request
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">
            To prevent arbitrary delays, FairWork requires a written explanation referencing the
            milestone acceptance criteria.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0F172A]">
              Written Reason for Revision (Required)
            </label>
            <textarea
              rows={3}
              value={revisionReason}
              onChange={(e) => {
                setRevisionReason(e.target.value);
                setRevisionError(null);
              }}
              placeholder="Specify what items need adjustment..."
              className="w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
            />
            {revisionError && (
              <p className="mt-1 text-xs font-medium text-[#DC2626]">{revisionError}</p>
            )}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
