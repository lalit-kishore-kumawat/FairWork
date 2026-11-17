import React, { createContext, useContext, useState } from 'react';
import {
  MOCK_ACTIVITIES,
  MOCK_ADMIN_AUDIT_LOGS,
  MOCK_DISPUTES,
  MOCK_MILESTONES,
  MOCK_NOTIFICATIONS,
  MOCK_PAYMENTS,
  MOCK_PROJECTS,
  MOCK_SUBMISSIONS,
  MOCK_USERS,
} from '@/src/data/mockData';
import { fairworkService } from '@/src/services/fairworkService';
import {
  ActivityEvent,
  AdminAuditLog,
  DeliverableSubmission,
  Dispute,
  DisputeCategory,
  DisputeStatus,
  Milestone,
  NotificationItem,
  PaymentRecord,
  Project,
  User,
} from '@/src/types';

interface AppDataContextValue {
  users: User[];
  projects: Project[];
  milestones: Milestone[];
  submissions: DeliverableSubmission[];
  payments: PaymentRecord[];
  disputes: Dispute[];
  notifications: NotificationItem[];
  activities: ActivityEvent[];
  adminAuditLogs: AdminAuditLog[];

  createProject: (
    params: Parameters<typeof fairworkService.createProjectPayload>[0]
  ) => Project;
  acceptProjectInvitation: (projectId: string, freelancer: User) => void;
  declineProjectInvitation: (projectId: string, freelancer: User) => void;
  confirmProjectAgreement: (projectId: string, actor: User) => void;

  createMilestone: (milestone: Omit<Milestone, 'id' | 'order' | 'status' | 'progress'>) => Milestone;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;

  submitDeliverable: (params: {
    milestone: Milestone;
    project: Project;
    freelancer: User;
    description: string;
    progressNotes: string;
    fileNames: string[];
    screenshotUrls: string[];
  }) => DeliverableSubmission;

  approveDeliverable: (params: {
    submissionId: string;
    milestoneId: string;
    project: Project;
    client: User;
    feedback?: string;
  }) => void;

  requestDeliverableRevision: (params: {
    submissionId: string;
    milestoneId: string;
    project: Project;
    client: User;
    reason: string;
  }) => void;

  raiseDispute: (params: {
    project: Project;
    milestone: Milestone;
    user: User;
    category: DisputeCategory;
    description: string;
    evidenceFileNames: string[];
  }) => Dispute;

  addDisputeComment: (disputeId: string, author: User, message: string) => void;

  resolveDispute: (params: {
    disputeId: string;
    admin: User;
    status: DisputeStatus;
    decisionNotes: string;
  }) => void;

  toggleUserAccountStatus: (userId: string, admin: User, reason: string) => void;

  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [submissions, setSubmissions] = useState<DeliverableSubmission[]>(MOCK_SUBMISSIONS);
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activities, setActivities] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>(MOCK_ADMIN_AUDIT_LOGS);

  const createProject: AppDataContextValue['createProject'] = (params) => {
    const { project, milestones: newMilestones, activity, notification } =
      fairworkService.createProjectPayload(params);
    setProjects((prev) => [project, ...prev]);
    setMilestones((prev) => [...prev, ...newMilestones]);
    setActivities((prev) => [activity, ...prev]);
    setNotifications((prev) => [notification, ...prev]);
    return project;
  };

  const acceptProjectInvitation = (projectId: string, freelancer: User) => {
    const nowIso = new Date().toISOString();
    const targetProject = projects.find((p) => p.id === projectId);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: 'Active',
              agreementConfirmed: true,
              agreementConfirmedAt: nowIso,
              lastActivityAt: nowIso,
            }
          : p
      )
    );
    setMilestones((prev) =>
      prev.map((m, idx) =>
        m.projectId === projectId && m.order === 1
          ? { ...m, status: 'In Progress', progress: 15 }
          : m
      )
    );
    if (targetProject) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          projectId,
          projectTitle: targetProject.title,
          actorName: freelancer.name,
          actorRole: 'freelancer',
          action: 'Accepted project agreement',
          detail: 'Agreement terms and milestone schedule confirmed.',
          timestamp: nowIso,
          category: 'agreement',
        },
        ...prev,
      ]);
      setNotifications((prev) => [
        {
          id: `ntf-${Date.now()}`,
          userId: targetProject.clientId,
          type: 'project_accepted',
          title: `Invitation accepted: ${targetProject.title}`,
          message: `${freelancer.name} accepted the milestone agreement and started work.`,
          createdAt: nowIso,
          read: false,
          link: `/projects/${projectId}`,
          projectId,
        },
        ...prev,
      ]);
    }
  };

  const declineProjectInvitation = (projectId: string, freelancer: User) => {
    const nowIso = new Date().toISOString();
    const targetProject = projects.find((p) => p.id === projectId);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: 'Cancelled', lastActivityAt: nowIso } : p
      )
    );
    if (targetProject) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          projectId,
          projectTitle: targetProject.title,
          actorName: freelancer.name,
          actorRole: 'freelancer',
          action: 'Declined project invitation',
          detail: 'Project marked as Cancelled.',
          timestamp: nowIso,
          category: 'agreement',
        },
        ...prev,
      ]);
    }
  };

  const confirmProjectAgreement = (projectId: string, actor: User) => {
    const nowIso = new Date().toISOString();
    const target = projects.find((p) => p.id === projectId);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: p.status === 'Draft' || p.status === 'Awaiting Acceptance' ? 'Active' : p.status,
              agreementConfirmed: true,
              agreementConfirmedAt: nowIso,
              lastActivityAt: nowIso,
            }
          : p
      )
    );
    if (target) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          projectId,
          projectTitle: target.title,
          actorName: actor.name,
          actorRole: actor.role,
          action: 'Confirmed project agreement',
          detail: 'Scope, milestone breakdown, and revision policy signed off.',
          timestamp: nowIso,
          category: 'agreement',
        },
        ...prev,
      ]);
    }
  };

  const createMilestone: AppDataContextValue['createMilestone'] = (payload) => {
    const existing = milestones.filter((m) => m.projectId === payload.projectId);
    const created: Milestone = {
      ...payload,
      id: `ms-${Date.now()}`,
      order: existing.length + 1,
      status: 'Not Started',
      progress: 0,
    };
    setMilestones((prev) => [...prev, created]);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === payload.projectId ? { ...p, budget: p.budget + payload.amount } : p
      )
    );
    return created;
  };

  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m))
    );
  };

  const submitDeliverable: AppDataContextValue['submitDeliverable'] = (params) => {
    const { submission, activity, notification } = fairworkService.buildSubmissionPayload(params);
    setSubmissions((prev) => [submission, ...prev]);
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === params.milestone.id ? { ...m, status: 'Submitted', progress: 95 } : m
      )
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === params.project.id
          ? { ...p, status: 'In Review', lastActivityAt: submission.submittedAt }
          : p
      )
    );
    setActivities((prev) => [activity, ...prev]);
    setNotifications((prev) => [notification, ...prev]);
    return submission;
  };

  const approveDeliverable: AppDataContextValue['approveDeliverable'] = ({
    submissionId,
    milestoneId,
    project,
    client,
    feedback,
  }) => {
    const nowIso = new Date().toISOString();
    const milestone = milestones.find((m) => m.id === milestoneId);

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              decision: 'Approved',
              clientFeedback: feedback || 'Deliverable verified against acceptance criteria.',
              reviewedAt: nowIso,
            }
          : s
      )
    );

    const updatedMilestones = milestones.map((m) =>
      m.id === milestoneId ? { ...m, status: 'Payment Pending' as const, progress: 100 } : m
    );
    setMilestones(updatedMilestones);

    const projectMilestones = updatedMilestones.filter((m) => m.projectId === project.id);
    const allComplete = projectMilestones.every(
      (m) => m.status === 'Approved' || m.status === 'Payment Pending' || m.status === 'Paid'
    );

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id
          ? { ...p, status: allComplete ? 'Completed' : 'Active', lastActivityAt: nowIso }
          : p
      )
    );

    if (milestone) {
      const paymentExists = payments.some((pay) => pay.milestoneId === milestoneId);
      if (!paymentExists) {
        const newPayment = fairworkService.buildPaymentRecordForApproval(project, milestone);
        setPayments((prev) => [newPayment, ...prev]);
      } else {
        setPayments((prev) =>
          prev.map((pay) =>
            pay.milestoneId === milestoneId ? { ...pay, status: 'Processing' } : pay
          )
        );
      }

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          projectId: project.id,
          projectTitle: project.title,
          actorName: client.name,
          actorRole: 'client',
          action: `Approved deliverable for ${milestone.title}`,
          detail: feedback || 'Milestone marked Payment Pending in prototype ledger.',
          timestamp: nowIso,
          category: 'approval',
        },
        ...prev,
      ]);

      setNotifications((prev) => [
        {
          id: `ntf-${Date.now()}`,
          userId: project.freelancerId,
          type: 'deliverable_approved',
          title: `Deliverable approved: ${milestone.title}`,
          message: `${client.name} approved your deliverable on ${project.title}.`,
          createdAt: nowIso,
          read: false,
          link: `/projects/${project.id}/milestones`,
          projectId: project.id,
        },
        ...prev,
      ]);
    }
  };

  const requestDeliverableRevision: AppDataContextValue['requestDeliverableRevision'] = ({
    submissionId,
    milestoneId,
    project,
    client,
    reason,
  }) => {
    const nowIso = new Date().toISOString();
    const milestone = milestones.find((m) => m.id === milestoneId);

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              decision: 'Revision Requested',
              revisionReason: reason,
              clientFeedback: reason,
              reviewedAt: nowIso,
            }
          : s
      )
    );

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, status: 'Revision Requested', progress: 70 } : m
      )
    );

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, status: 'Active', lastActivityAt: nowIso } : p
      )
    );

    if (milestone) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          projectId: project.id,
          projectTitle: project.title,
          actorName: client.name,
          actorRole: 'client',
          action: `Requested revision on ${milestone.title}`,
          detail: reason,
          timestamp: nowIso,
          category: 'revision',
        },
        ...prev,
      ]);

      setNotifications((prev) => [
        {
          id: `ntf-${Date.now()}`,
          userId: project.freelancerId,
          type: 'revision_requested',
          title: `Revision requested: ${milestone.title}`,
          message: reason,
          createdAt: nowIso,
          read: false,
          link: `/projects/${project.id}/deliverables`,
          projectId: project.id,
        },
        ...prev,
      ]);
    }
  };

  const raiseDispute: AppDataContextValue['raiseDispute'] = (params) => {
    const { dispute, activity, notification } = fairworkService.buildDisputePayload(params);
    setDisputes((prev) => [dispute, ...prev]);
    setMilestones((prev) =>
      prev.map((m) => (m.id === params.milestone.id ? { ...m, status: 'Disputed' } : m))
    );
    setProjects((prev) =>
      prev.map((p) => (p.id === params.project.id ? { ...p, status: 'Disputed' } : p))
    );
    setActivities((prev) => [activity, ...prev]);
    setNotifications((prev) => [notification, ...prev]);
    return dispute;
  };

  const addDisputeComment = (disputeId: string, author: User, message: string) => {
    const nowIso = new Date().toISOString();
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              comments: [
                ...d.comments,
                {
                  id: `dc-${Date.now()}`,
                  authorId: author.id,
                  authorName: author.name,
                  authorRole: author.role,
                  message,
                  createdAt: nowIso,
                },
              ],
              auditTrail: [
                ...d.auditTrail,
                {
                  id: `au-${Date.now()}`,
                  actorName: author.name,
                  actorRole: author.role,
                  action: 'Added comment to dispute thread',
                  timestamp: nowIso,
                },
              ],
            }
          : d
      )
    );
  };

  const resolveDispute: AppDataContextValue['resolveDispute'] = ({
    disputeId,
    admin,
    status,
    decisionNotes,
  }) => {
    if (admin.role !== 'admin') return;
    const target = disputes.find((d) => d.id === disputeId);
    if (!target) return;
    const resolved = fairworkService.buildDisputeResolution(target, admin, status, decisionNotes);
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? resolved : d)));
    setAdminAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        adminName: admin.name,
        target: `${disputeId} (${target.projectName})`,
        action: `Dispute Resolution: ${status}`,
        reason: decisionNotes,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const toggleUserAccountStatus = (userId: string, admin: User, reason: string) => {
    if (admin.role !== 'admin') return;
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    setAdminAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        adminName: admin.name,
        target: `${targetUser.name} (${targetUser.id})`,
        action: nextStatus === 'Suspended' ? 'Suspended Account' : 'Reactivated Account',
        reason,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
  };

  return (
    <AppDataContext.Provider
      value={{
        users,
        projects,
        milestones,
        submissions,
        payments,
        disputes,
        notifications,
        activities,
        adminAuditLogs,
        createProject,
        acceptProjectInvitation,
        declineProjectInvitation,
        confirmProjectAgreement,
        createMilestone,
        updateMilestone,
        submitDeliverable,
        approveDeliverable,
        requestDeliverableRevision,
        raiseDispute,
        addDisputeComment,
        resolveDispute,
        toggleUserAccountStatus,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
