import {
  ActivityEvent,
  DeliverableSubmission,
  Dispute,
  DisputeCategory,
  DisputeStatus,
  Milestone,
  NotificationItem,
  PaymentRecord,
  Project,
  User,
  UserRole,
} from '@/src/types';

/**
 * Structured frontend service layer ready for REST / GraphQL backend integration.
 * Replace in-memory builders with `fetch('/api/...')` calls when backend endpoints are provisioned.
 */
export const fairworkService = {
  createProjectPayload(params: {
    title: string;
    category: string;
    summary: string;
    scope: string;
    objectives: string[];
    deliverablesSummary: string;
    revisionPolicy: string;
    client: User;
    freelancerName: string;
    freelancerEmail: string;
    freelancerId?: string;
    deadline: string;
    milestones: Array<{
      title: string;
      description: string;
      amount: number;
      dueDate: string;
      deliverableLabel: string;
      acceptanceCriteria: string[];
    }>;
    asDraft?: boolean;
  }): { project: Project; milestones: Milestone[]; activity: ActivityEvent; notification: NotificationItem } {
    const projectId = `prj-${Date.now().toString().slice(-4)}`;
    const totalBudget = params.milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const nowIso = new Date().toISOString();

    const project: Project = {
      id: projectId,
      title: params.title,
      category: params.category,
      summary: params.summary,
      scope: params.scope,
      objectives: params.objectives.filter(Boolean),
      deliverablesSummary: params.deliverablesSummary,
      revisionPolicy: params.revisionPolicy,
      clientId: params.client.id,
      clientName: params.client.name,
      freelancerId: params.freelancerId || 'usr-freelancer-1',
      freelancerName: params.freelancerName,
      freelancerEmail: params.freelancerEmail,
      budget: totalBudget,
      startDate: nowIso.slice(0, 10),
      deadline: params.deadline,
      status: params.asDraft ? 'Draft' : 'Awaiting Acceptance',
      agreementConfirmed: false,
      lastActivityAt: nowIso,
      documents: [],
    };

    const milestones: Milestone[] = params.milestones.map((m, idx) => ({
      id: `ms-${projectId}-${idx + 1}`,
      projectId,
      order: idx + 1,
      title: m.title,
      description: m.description,
      acceptanceCriteria: m.acceptanceCriteria.length > 0 ? m.acceptanceCriteria : ['Verified against agreed project scope'],
      amount: Number(m.amount),
      dueDate: m.dueDate,
      deliverableLabel: m.deliverableLabel || 'Deliverable Package',
      status: 'Not Started',
      progress: 0,
    }));

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      projectId,
      projectTitle: project.title,
      actorName: params.client.name,
      actorRole: 'client',
      action: params.asDraft ? 'Saved project draft' : 'Sent structured project invitation',
      detail: `${milestones.length} milestones structured totaling $${totalBudget.toLocaleString()}.`,
      timestamp: nowIso,
      category: 'agreement',
    };

    const notification: NotificationItem = {
      id: `ntf-${Date.now()}`,
      userId: project.freelancerId,
      type: 'invitation',
      title: `New project invitation: ${project.title}`,
      message: `${params.client.name} invited you to review a ${milestones.length}-milestone agreement ($${totalBudget.toLocaleString()}).`,
      createdAt: nowIso,
      read: false,
      link: '/freelancer/dashboard',
      projectId,
    };

    return { project, milestones, activity, notification };
  },

  buildSubmissionPayload(params: {
    milestone: Milestone;
    project: Project;
    freelancer: User;
    description: string;
    progressNotes: string;
    fileNames: string[];
    screenshotUrls: string[];
  }): {
    submission: DeliverableSubmission;
    activity: ActivityEvent;
    notification: NotificationItem;
  } {
    const nowIso = new Date().toISOString();
    const submission: DeliverableSubmission = {
      id: `sub-${Date.now()}`,
      milestoneId: params.milestone.id,
      projectId: params.project.id,
      submittedById: params.freelancer.id,
      submittedByName: params.freelancer.name,
      submittedAt: nowIso,
      description: params.description,
      progressNotes: params.progressNotes,
      files: params.fileNames.map((name, idx) => ({
        id: `file-${Date.now()}-${idx}`,
        name,
        sizeLabel: '1.2 MB',
        fileType: name.endsWith('.pdf') ? 'pdf' : name.endsWith('.zip') ? 'archive' : 'code',
      })),
      screenshots: params.screenshotUrls.map((url, idx) => ({
        id: `scr-${Date.now()}-${idx}`,
        name: `deliverable-preview-${idx + 1}.jpg`,
        sizeLabel: '980 KB',
        fileType: 'image',
        previewUrl: url,
      })),
      decision: 'Pending Review',
    };

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      projectId: params.project.id,
      projectTitle: params.project.title,
      actorName: params.freelancer.name,
      actorRole: 'freelancer',
      action: `Submitted deliverable for ${params.milestone.title}`,
      detail: params.description,
      timestamp: nowIso,
      category: 'milestone',
    };

    const notification: NotificationItem = {
      id: `ntf-${Date.now()}`,
      userId: params.project.clientId,
      type: 'milestone_submitted',
      title: `Deliverable submitted: ${params.milestone.title}`,
      message: `${params.freelancer.name} submitted work on ${params.project.title} for your review.`,
      createdAt: nowIso,
      read: false,
      link: `/projects/${params.project.id}/deliverables`,
      projectId: params.project.id,
    };

    return { submission, activity, notification };
  },

  buildPaymentRecordForApproval(project: Project, milestone: Milestone): PaymentRecord {
    return {
      id: `pay-${Date.now()}`,
      projectId: project.id,
      projectName: project.title,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      clientId: project.clientId,
      freelancerId: project.freelancerId,
      amount: milestone.amount,
      reference: `MOCK-TXN-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Processing',
      providerLabel: 'Prototype Ledger Record (Pending Backend Settlement)',
      isPrototypeData: true,
    };
  },

  buildDisputePayload(params: {
    project: Project;
    milestone: Milestone;
    user: User;
    category: DisputeCategory;
    description: string;
    evidenceFileNames: string[];
  }): { dispute: Dispute; activity: ActivityEvent; notification: NotificationItem } {
    const nowIso = new Date().toISOString();
    const disputeId = `DSP-2026-${Math.floor(100 + Math.random() * 899)}`;

    const dispute: Dispute = {
      id: disputeId,
      projectId: params.project.id,
      projectName: params.project.title,
      milestoneId: params.milestone.id,
      milestoneTitle: params.milestone.title,
      raisedById: params.user.id,
      raisedByName: params.user.name,
      raisedByRole: params.user.role,
      category: params.category,
      description: params.description,
      evidenceFiles: params.evidenceFileNames.map((name, idx) => ({
        id: `ev-${Date.now()}-${idx}`,
        name,
        sizeLabel: '450 KB',
        fileType: 'pdf',
      })),
      createdAt: nowIso,
      status: 'Open',
      comments: [],
      auditTrail: [
        {
          id: `au-${Date.now()}`,
          actorName: params.user.name,
          actorRole: params.user.role,
          action: `Opened dispute ${disputeId} (${params.category})`,
          timestamp: nowIso,
        },
      ],
    };

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      projectId: params.project.id,
      projectTitle: params.project.title,
      actorName: params.user.name,
      actorRole: params.user.role,
      action: `Opened dispute ${disputeId}`,
      detail: `${params.category} — ${params.milestone.title}`,
      timestamp: nowIso,
      category: 'dispute',
    };

    const notification: NotificationItem = {
      id: `ntf-${Date.now()}`,
      userId: 'usr-admin-1',
      type: 'dispute',
      title: `New dispute filed: ${disputeId}`,
      message: `${params.user.name} raised a dispute on ${params.project.title} (${params.category}).`,
      createdAt: nowIso,
      read: false,
      link: '/disputes',
      projectId: params.project.id,
    };

    return { dispute, activity, notification };
  },

  buildDisputeResolution(
    dispute: Dispute,
    admin: User,
    status: DisputeStatus,
    decisionNotes: string
  ): Dispute {
    const nowIso = new Date().toISOString();
    return {
      ...dispute,
      status,
      adminDecision: decisionNotes,
      resolvedAt: nowIso,
      comments: [
        ...dispute.comments,
        {
          id: `dc-${Date.now()}`,
          authorId: admin.id,
          authorName: admin.name,
          authorRole: 'admin' as UserRole,
          message: `Administrative Decision (${status}): ${decisionNotes}`,
          createdAt: nowIso,
        },
      ],
      auditTrail: [
        ...dispute.auditTrail,
        {
          id: `au-${Date.now()}`,
          actorName: admin.name,
          actorRole: 'admin',
          action: `Recorded outcome: ${status}`,
          timestamp: nowIso,
        },
      ],
    };
  },
};
