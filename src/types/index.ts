export type UserRole = 'client' | 'freelancer' | 'admin';

export type AccountStatus = 'Active' | 'Suspended';

export interface NotificationPreferences {
  milestoneUpdates: boolean;
  deliverableSubmissions: boolean;
  paymentStatusChanges: boolean;
  inactivityAlerts: boolean;
  disputeUpdates: boolean;
}

export interface PrivacyPreferences {
  showPortfolioPublicly: boolean;
  allowDirectInvites: boolean;
  shareActivityTimestamps: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title: string;
  company?: string;
  phone: string;
  location: string;
  skills: string[];
  portfolioLinks: string[];
  bio: string;
  status: AccountStatus;
  joinedAt: string;
  notificationPrefs: NotificationPreferences;
  privacyPrefs: PrivacyPreferences;
}

export type ProjectStatus =
  | 'Draft'
  | 'Awaiting Acceptance'
  | 'Active'
  | 'In Review'
  | 'Disputed'
  | 'Completed'
  | 'Cancelled';

export interface ProjectDocument {
  id: string;
  name: string;
  sizeLabel: string;
  uploadedBy: string;
  uploadedAt: string;
  type: 'pdf' | 'image' | 'doc' | 'zip';
  previewUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  summary: string;
  scope: string;
  objectives: string[];
  deliverablesSummary: string;
  revisionPolicy: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  budget: number;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  agreementConfirmed: boolean;
  agreementConfirmedAt?: string;
  lastActivityAt: string;
  inactivityAlert?: string;
  documents: ProjectDocument[];
}

export type MilestoneStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Revision Requested'
  | 'Approved'
  | 'Payment Pending'
  | 'Paid'
  | 'Disputed';

export interface Milestone {
  id: string;
  projectId: string;
  order: number;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  amount: number;
  dueDate: string;
  deliverableLabel: string;
  status: MilestoneStatus;
  progress: number;
}

export interface SubmissionFile {
  id: string;
  name: string;
  sizeLabel: string;
  fileType: 'image' | 'pdf' | 'archive' | 'code';
  previewUrl?: string;
}

export interface DeliverableSubmission {
  id: string;
  milestoneId: string;
  projectId: string;
  submittedById: string;
  submittedByName: string;
  submittedAt: string;
  description: string;
  progressNotes: string;
  files: SubmissionFile[];
  screenshots: SubmissionFile[];
  clientFeedback?: string;
  revisionReason?: string;
  decision: 'Pending Review' | 'Approved' | 'Revision Requested';
  reviewedAt?: string;
}

export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Successful'
  | 'Failed'
  | 'Refunded'
  | 'Disputed';

export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  milestoneId: string;
  milestoneTitle: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  reference: string;
  date: string;
  status: PaymentStatus;
  providerLabel: string;
  isPrototypeData: true;
}

export type DisputeCategory =
  | 'Freelancer stopped responding'
  | 'Missed deadline'
  | 'Incomplete deliverables'
  | 'Payment not received'
  | 'Client not responding'
  | 'Scope disagreement'
  | 'Other';

export type DisputeStatus =
  | 'Open'
  | 'Under Review'
  | 'Resolved - Client Favored'
  | 'Resolved - Freelancer Favored'
  | 'Resolved - Split Settlement'
  | 'Closed';

export interface DisputeComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  createdAt: string;
}

export interface DisputeAuditEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  projectName: string;
  milestoneId: string;
  milestoneTitle: string;
  raisedById: string;
  raisedByName: string;
  raisedByRole: UserRole;
  category: DisputeCategory;
  description: string;
  evidenceFiles: SubmissionFile[];
  createdAt: string;
  status: DisputeStatus;
  comments: DisputeComment[];
  adminDecision?: string;
  resolvedAt?: string;
  auditTrail: DisputeAuditEntry[];
}

export type NotificationType =
  | 'invitation'
  | 'project_accepted'
  | 'milestone_submitted'
  | 'revision_requested'
  | 'deliverable_approved'
  | 'payment_updated'
  | 'deadline_approaching'
  | 'inactivity_detected'
  | 'dispute';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link: string;
  projectId?: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  projectTitle: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  detail: string;
  timestamp: string;
  category: 'milestone' | 'approval' | 'payment' | 'revision' | 'agreement' | 'dispute';
}

export interface AdminAuditLog {
  id: string;
  adminName: string;
  target: string;
  action: string;
  reason: string;
  timestamp: string;
}
