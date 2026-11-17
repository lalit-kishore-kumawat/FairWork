import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Download, FileText, RotateCcw } from 'lucide-react';
import { Modal } from '@/src/components/common/Modal';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { DeliverableSubmission, Milestone, Project, UserRole } from '@/src/types';
import { formatCurrency, formatDate, formatDateTime } from '@/src/utils/formatters';
import { useToast } from '@/src/context/ToastContext';

interface MilestoneDetailModalProps {
  open: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  project: Project | null;
  submissions: DeliverableSubmission[];
  userRole: UserRole;
  onApprove?: (submissionId: string, feedback: string) => void;
  onRequestRevision?: (submissionId: string, reason: string) => void;
}

export function MilestoneDetailModal({
  open,
  onClose,
  milestone,
  project,
  submissions,
  userRole,
  onApprove,
  onRequestRevision,
}: MilestoneDetailModalProps) {
  const { addToast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  if (!milestone || !project) return null;

  const latestPending = submissions.find((s) => s.decision === 'Pending Review');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Milestone ${milestone.order}: ${milestone.title}`}
      subtitle={`${project.title} · Due ${formatDate(milestone.dueDate)}`}
      maxWidth="xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Link
            to={`/projects/${project.id}/deliverables`}
            onClick={onClose}
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Open Full Deliverables Workspace
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#64748B]">Deliverable Target</span>
            <p className="text-sm font-semibold text-[#0F172A]">{milestone.deliverableLabel}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#64748B]">Milestone Allocation</span>
            <p className="font-mono text-base font-bold text-[#0F172A] tabular-nums">
              {formatCurrency(milestone.amount)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#64748B]">Current Status</span>
            <div>
              <StatusBadge status={milestone.status} />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#0F172A]">Description & Scope</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">{milestone.description}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#0F172A]">Acceptance Criteria</h4>
          <ul className="mt-2 space-y-1.5">
            {milestone.acceptanceCriteria.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-[#0F172A]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Submission History */}
        <div className="border-t border-[#E2E8F0] pt-5">
          <h4 className="text-sm font-semibold text-[#0F172A]">
            Submission History ({submissions.length})
          </h4>
          {submissions.length === 0 ? (
            <p className="mt-2 text-sm text-[#64748B]">
              No deliverables have been submitted for this milestone yet.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        Submitted by {sub.submittedByName}
                      </p>
                      <p className="font-mono text-xs text-[#64748B] tabular-nums">
                        {formatDateTime(sub.submittedAt)}
                      </p>
                    </div>
                    <StatusBadge status={sub.decision} />
                  </div>

                  <p className="text-sm text-[#0F172A]">{sub.description}</p>
                  {sub.progressNotes && (
                    <p className="text-xs text-[#64748B]">Notes: {sub.progressNotes}</p>
                  )}

                  {sub.files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sub.files.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() =>
                            addToast({
                              variant: 'info',
                              title: `Downloading ${file.name}`,
                              description: 'Prototype file download simulated.',
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-100"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                          <span>{file.name}</span>
                          <Download className="h-3 w-3 text-[#64748B]" />
                        </button>
                      ))}
                    </div>
                  )}

                  {sub.clientFeedback && (
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A]">
                      <span className="font-semibold">Client Review Comment: </span>
                      {sub.clientFeedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Approval Controls */}
        {userRole === 'client' && latestPending && (onApprove || onRequestRevision) && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">Client Review Controls</h4>
            {!showRevisionInput ? (
              <>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Optional approval feedback comment..."
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  {onApprove && (
                    <button
                      type="button"
                      onClick={() => {
                        onApprove(latestPending.id, feedback);
                        setFeedback('');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Milestone</span>
                    </button>
                  )}
                  {onRequestRevision && (
                    <button
                      type="button"
                      onClick={() => setShowRevisionInput(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Request Revision</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2.5">
                <label className="block text-xs font-medium text-[#0F172A]">
                  Written Reason for Revision (Required)
                </label>
                <textarea
                  rows={2}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Explain what needs adjustment relative to the acceptance criteria..."
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={revisionReason.trim().length < 5}
                    onClick={() => {
                      onRequestRevision?.(latestPending.id, revisionReason.trim());
                      setRevisionReason('');
                      setShowRevisionInput(false);
                    }}
                    className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    Submit Revision Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(false)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-medium text-[#64748B]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
