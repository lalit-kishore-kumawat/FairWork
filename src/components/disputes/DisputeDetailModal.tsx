import { useState } from 'react';
import { FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import { Modal } from '@/src/components/common/Modal';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { Dispute, DisputeStatus } from '@/src/types';
import { formatCurrency, formatDate, formatDateTime } from '@/src/utils/formatters';

interface DisputeDetailModalProps {
  open: boolean;
  onClose: () => void;
  dispute: Dispute | null;
}

export function DisputeDetailModal({ open, onClose, dispute }: DisputeDetailModalProps) {
  const { currentUser } = useAuth();
  const { projects, milestones, submissions, addDisputeComment, resolveDispute } = useAppData();
  const { addToast } = useToast();

  const [commentText, setCommentText] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<DisputeStatus>(
    'Resolved - Split Settlement'
  );
  const [decisionNotes, setDecisionNotes] = useState('');

  if (!dispute) return null;

  const project = projects.find((p) => p.id === dispute.projectId);
  const milestone = milestones.find((m) => m.id === dispute.milestoneId);
  const milestoneSubs = submissions.filter((s) => s.milestoneId === dispute.milestoneId);

  const handleAddComment = () => {
    if (!currentUser || !commentText.trim()) return;
    addDisputeComment(dispute.id, currentUser, commentText.trim());
    setCommentText('');
    addToast({ variant: 'success', title: 'Comment added to dispute record' });
  };

  const handleResolve = () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (decisionNotes.trim().length < 10) {
      addToast({
        variant: 'error',
        title: 'Administrative rationale required',
        description: 'Enter at least 10 characters explaining the evidence-based decision.',
      });
      return;
    }
    resolveDispute({
      disputeId: dispute.id,
      admin: currentUser,
      status: resolutionStatus,
      decisionNotes: decisionNotes.trim(),
    });
    setDecisionNotes('');
    addToast({
      variant: 'success',
      title: `Dispute ${dispute.id} updated`,
      description: `Outcome recorded in audit trail: ${resolutionStatus}`,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${dispute.id} — ${dispute.category}`}
      subtitle={`${dispute.projectName} · Raised by ${dispute.raisedByName} on ${formatDate(dispute.createdAt)}`}
      maxWidth="2xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div>
            <p className="text-xs text-[#64748B]">Disputed Milestone</p>
            <p className="text-sm font-semibold text-[#0F172A]">{dispute.milestoneTitle}</p>
          </div>
          {milestone && (
            <div>
              <p className="text-xs text-[#64748B]">Milestone Amount</p>
              <p className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
                {formatCurrency(milestone.amount)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-[#64748B]">Resolution Status</p>
            <StatusBadge status={dispute.status} />
          </div>
        </div>

        {/* Summary & Agreement Context */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">Dispute Statement</h4>
            <p className="text-sm leading-relaxed text-[#64748B]">{dispute.description}</p>

            <div>
              <h5 className="text-xs font-semibold text-[#0F172A]">Supporting Evidence</h5>
              {dispute.evidenceFiles.length === 0 ? (
                <p className="mt-1 text-xs text-[#64748B]">No evidence files attached.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {dispute.evidenceFiles.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs"
                    >
                      <span className="inline-flex items-center gap-2 font-medium text-[#0F172A]">
                        <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                        {ev.name}
                      </span>
                      <span className="font-mono text-[#64748B] tabular-nums">{ev.sizeLabel}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <h4 className="text-sm font-semibold text-[#0F172A]">Project Agreement Context</h4>
            {project ? (
              <div className="space-y-2 text-xs text-[#64748B]">
                <p>
                  <span className="font-semibold text-[#0F172A]">Scope: </span>
                  {project.scope}
                </p>
                <p>
                  <span className="font-semibold text-[#0F172A]">Revision Policy: </span>
                  {project.revisionPolicy}
                </p>
                <p>
                  <span className="font-semibold text-[#0F172A]">Submissions Logged: </span>
                  {milestoneSubs.length} submission(s) on this milestone
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">Agreement snapshot unavailable.</p>
            )}
          </div>
        </div>

        {/* Admin Recorded Outcome */}
        {dispute.adminDecision && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#16A34A]">
              <ShieldCheck className="h-4 w-4" />
              <span>Recorded Administrative Decision</span>
            </div>
            <p className="mt-1.5 text-sm text-[#0F172A]">{dispute.adminDecision}</p>
          </div>
        )}

        {/* Comments Thread */}
        <div className="border-t border-[#E2E8F0] pt-5 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <MessageSquare className="h-4 w-4 text-[#64748B]" />
            <span>Discussion & Case Log ({dispute.comments.length})</span>
          </h4>

          <div className="space-y-2.5">
            {dispute.comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-[#E2E8F0] bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#0F172A]">
                    {c.authorName} ({c.authorRole})
                  </span>
                  <span className="font-mono text-[#64748B] tabular-nums">
                    {formatDateTime(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748B]">{c.message}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add an evidence note or response..."
              className="h-10 flex-1 rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="whitespace-nowrap rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
            >
              Post Note
            </button>
          </div>
        </div>

        {/* Admin Decision Form (Role-Enforced in UI) */}
        {currentUser?.role === 'admin' && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">
              Administrator Resolution Panel
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">
                  Resolution Outcome
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as DisputeStatus)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved - Client Favored">Resolved - Client Favored</option>
                  <option value="Resolved - Freelancer Favored">
                    Resolved - Freelancer Favored
                  </option>
                  <option value="Resolved - Split Settlement">
                    Resolved - Split Settlement
                  </option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#0F172A]">
                Administrative Decision & Audit Rationale
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Document findings based on project agreement and submitted evidence..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleResolve}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Record Administrative Decision
            </button>
          </div>
        )}

        {/* Audit Trail */}
        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="text-xs font-semibold text-[#64748B]">Audit History</h4>
          <ul className="mt-2 space-y-1.5">
            {dispute.auditTrail.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]"
              >
                <span>
                  <strong className="text-[#0F172A]">{entry.actorName}</strong> — {entry.action}
                </span>
                <span className="font-mono tabular-nums">{formatDateTime(entry.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
