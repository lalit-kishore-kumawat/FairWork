import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { AdminLayout } from '@/src/layouts/AdminLayout';
import { MetricCard } from '@/src/components/dashboard/MetricCard';
import { ProjectProgressChart } from '@/src/components/dashboard/ProjectProgressChart';
import { SearchInput } from '@/src/components/common/SearchInput';
import { FilterDropdown } from '@/src/components/common/FilterDropdown';
import { DataTable, DataTableColumn } from '@/src/components/common/DataTable';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { Avatar } from '@/src/components/common/Avatar';
import { Modal } from '@/src/components/common/Modal';
import { PrototypeNotice } from '@/src/components/common/PrototypeNotice';
import { DisputeDetailModal } from '@/src/components/disputes/DisputeDetailModal';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { Dispute, PaymentRecord, Project, User } from '@/src/types';
import { formatCurrency, formatDate, formatDateTime } from '@/src/utils/formatters';

interface AdminDashboardProps {
  section?: 'overview' | 'users' | 'projects' | 'disputes' | 'payments' | 'reports';
}

export function AdminDashboard({ section = 'overview' }: AdminDashboardProps) {
  const { currentUser } = useAuth();
  const {
    users,
    projects,
    milestones,
    disputes,
    payments,
    adminAuditLogs,
    toggleUserAccountStatus,
  } = useAppData();
  const { addToast } = useToast();

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const totalClients = users.filter((u) => u.role === 'client').length;
  const totalFreelancers = users.filter((u) => u.role === 'freelancer').length;
  const activeDisputes = disputes.filter(
    (d) => d.status === 'Open' || d.status === 'Under Review'
  ).length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !userSearch.trim() ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  const activeDispute = disputes.find((d) => d.id === selectedDisputeId) || null;

  const userColumns: DataTableColumn<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div>
            <p className="font-semibold text-[#0F172A]">{row.name}</p>
            <p className="text-xs text-[#64748B]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Account Type',
      render: (row) => (
        <span className="text-sm font-medium capitalize text-[#0F172A]">{row.role}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (row) => (
        <span className="font-mono text-xs text-[#64748B] tabular-nums">
          {formatDate(row.joinedAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-medium text-[#0F172A] hover:bg-slate-50"
          >
            Profile
          </button>
          {row.role !== 'admin' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSuspendReason('');
                setSuspendTarget(row);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                row.status === 'Active'
                  ? 'border-red-200 bg-red-50 text-[#DC2626] hover:bg-red-100'
                  : 'border-emerald-200 bg-emerald-50 text-[#16A34A] hover:bg-emerald-100'
              }`}
            >
              {row.status === 'Active' ? 'Suspend' : 'Activate'}
            </button>
          )}
        </div>
      ),
    },
  ];

  const disputeColumns: DataTableColumn<Dispute>[] = [
    {
      key: 'id',
      header: 'Dispute ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#2563EB] tabular-nums">
          {row.id}
        </span>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (row) => (
        <div>
          <p className="font-semibold text-[#0F172A]">{row.projectName}</p>
          <p className="text-xs text-[#64748B]">{row.milestoneTitle}</p>
        </div>
      ),
    },
    {
      key: 'raisedBy',
      header: 'Raised By',
      render: (row) => (
        <span className="text-sm text-[#0F172A]">
          {row.raisedByName} ({row.raisedByRole})
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Reason',
      render: (row) => <span className="text-sm text-[#0F172A]">{row.category}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'review',
      header: '',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedDisputeId(row.id)}
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Review Evidence
        </button>
      ),
    },
  ];

  const projectColumns: DataTableColumn<Project>[] = [
    {
      key: 'title',
      header: 'Project',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="font-semibold text-[#0F172A] hover:text-[#2563EB]"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: 'parties',
      header: 'Parties',
      render: (row) => (
        <span className="text-xs text-[#64748B]">
          {row.clientName} · {row.freelancerName}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold tabular-nums">
          {formatCurrency(row.budget)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const paymentColumns: DataTableColumn<PaymentRecord>[] = [
    {
      key: 'ref',
      header: 'Reference',
      render: (row) => (
        <span className="font-mono text-xs text-[#64748B] tabular-nums">{row.reference}</span>
      ),
    },
    {
      key: 'project',
      header: 'Project / Milestone',
      render: (row) => (
        <div>
          <p className="font-semibold text-[#0F172A]">{row.projectName}</p>
          <p className="text-xs text-[#64748B]">{row.milestoneTitle}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold tabular-nums">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const sectionTitles: Record<NonNullable<AdminDashboardProps['section']>, string> = {
    overview: 'Administrator Overview',
    users: 'User Management',
    projects: 'Platform Projects',
    disputes: 'Dispute Resolution Queue',
    payments: 'Platform Payment Ledger',
    reports: 'Accountability & Audit Reports',
  };

  return (
    <AdminLayout
      title={sectionTitles[section]}
      breadcrumb={`Admin Console · ${sectionTitles[section]}`}
    >
      <div className="space-y-6">
        {/* Top 6 Platform Statistics (shown on overview & reports) */}
        {(section === 'overview' || section === 'reports') && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="Total Users"
              value={users.length}
              icon={<Users className="h-4 w-4" />}
              tone="neutral"
            />
            <MetricCard
              label="Total Clients"
              value={totalClients}
              icon={<Briefcase className="h-4 w-4" />}
              tone="primary"
            />
            <MetricCard
              label="Total Freelancers"
              value={totalFreelancers}
              icon={<UserCheck className="h-4 w-4" />}
              tone="primary"
            />
            <MetricCard
              label="Total Projects"
              value={projects.length}
              icon={<FolderKanban className="h-4 w-4" />}
              tone="neutral"
            />
            <MetricCard
              label="Active Disputes"
              value={activeDisputes}
              icon={<AlertTriangle className="h-4 w-4" />}
              tone="danger"
            />
            <MetricCard
              label="Completed Projects"
              value={completedProjects}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="success"
            />
          </section>
        )}

        {/* User Management Section */}
        {(section === 'overview' || section === 'users') && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-[#0F172A]">
                  User Directory &amp; Compliance Controls
                </h2>
                <p className="text-xs text-[#64748B]">
                  Search users, inspect profiles, or suspend/reactivate accounts with audit logs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  value={userSearch}
                  onChange={setUserSearch}
                  placeholder="Search name or email..."
                  className="w-full sm:w-64"
                />
                <FilterDropdown
                  label="Role"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[
                    { label: 'All Types', value: 'All' },
                    { label: 'Client', value: 'client' },
                    { label: 'Freelancer', value: 'freelancer' },
                    { label: 'Admin', value: 'admin' },
                  ]}
                />
              </div>
            </div>

            <DataTable
              columns={userColumns}
              data={filteredUsers}
              rowKey={(r) => r.id}
              onRowClick={(r) => setSelectedUser(r)}
            />
          </section>
        )}

        {/* Dispute Management Section */}
        {(section === 'overview' || section === 'disputes') && (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Dispute Review &amp; Arbitration Queue
              </h2>
              <p className="text-xs text-[#64748B]">
                Review uploaded evidence, check agreement terms, and record administrative outcomes.
              </p>
            </div>
            <DataTable
              columns={disputeColumns}
              data={disputes}
              rowKey={(r) => r.id}
              onRowClick={(r) => setSelectedDisputeId(r.id)}
            />
          </section>
        )}

        {/* Platform Projects View */}
        {section === 'projects' && (
          <section className="space-y-4">
            <DataTable columns={projectColumns} data={projects} rowKey={(r) => r.id} />
          </section>
        )}

        {/* Platform Payments View */}
        {section === 'payments' && (
          <section className="space-y-4">
            <PrototypeNotice
              title="Prototype Financial Ledger"
              message="Payment statuses below reflect prototype mock records only. Backend webhook verification is required for production settlement."
            />
            <DataTable columns={paymentColumns} data={payments} rowKey={(r) => r.id} />
          </section>
        )}

        {/* Reports & Audit History */}
        {(section === 'overview' || section === 'reports') && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 lg:col-span-6">
              <h2 className="mb-3 font-display text-base font-semibold text-[#0F172A]">
                Project Completion Analytics
              </h2>
              <ProjectProgressChart projects={projects} milestones={milestones} />
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 lg:col-span-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                <h2 className="font-display text-base font-semibold text-[#0F172A]">
                  Administrative Audit History
                </h2>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {adminAuditLogs.map((log) => (
                  <div key={log.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-[#0F172A]">{log.action}</span>
                      <span className="font-mono text-xs text-[#64748B] tabular-nums">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      Admin: {log.adminName} · Target: {log.target}
                    </p>
                    <p className="mt-1 text-xs text-[#0F172A]">{log.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* View User Profile Modal */}
      <Modal
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="User Compliance Profile"
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} src={selectedUser.avatarUrl} size="lg" />
              <div>
                <h3 className="font-display text-lg font-bold text-[#0F172A]">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-[#64748B]">{selectedUser.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={selectedUser.status} />
                  <span className="text-xs capitalize text-[#64748B]">
                    Role: {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#64748B]">{selectedUser.bio}</p>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
              <div>
                <span className="text-[#64748B]">Title</span>
                <p className="font-medium text-[#0F172A]">{selectedUser.title}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Location</span>
                <p className="font-medium text-[#0F172A]">{selectedUser.location}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Joined</span>
                <p className="font-mono font-medium text-[#0F172A] tabular-nums">
                  {formatDate(selectedUser.joinedAt)}
                </p>
              </div>
              <div>
                <span className="text-[#64748B]">Skills</span>
                <p className="font-medium text-[#0F172A]">
                  {selectedUser.skills.join(', ') || '—'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend / Activate Confirmation Modal */}
      <Modal
        open={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        title={
          suspendTarget?.status === 'Active'
            ? `Suspend ${suspendTarget?.name}?`
            : `Reactivate ${suspendTarget?.name}?`
        }
        subtitle="Administrative account status changes are recorded in the permanent audit log."
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSuspendTarget(null)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!suspendTarget || !currentUser) return;
                if (suspendReason.trim().length < 5) {
                  addToast({
                    variant: 'error',
                    title: 'Audit reason required',
                    description: 'Provide at least 5 characters for the audit log.',
                  });
                  return;
                }
                toggleUserAccountStatus(suspendTarget.id, currentUser, suspendReason.trim());
                addToast({
                  variant: 'success',
                  title: 'Account status updated',
                  description: `${suspendTarget.name} status updated and logged.`,
                });
                setSuspendTarget(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                suspendTarget?.status === 'Active'
                  ? 'bg-[#DC2626] hover:bg-red-700'
                  : 'bg-[#16A34A] hover:bg-green-700'
              }`}
            >
              Confirm Action
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[#0F172A]">
            Audit Log Reason (Required)
          </label>
          <textarea
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Document compliance rationale..."
            className="w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
          />
        </div>
      </Modal>

      <DisputeDetailModal
        open={Boolean(activeDispute)}
        onClose={() => setSelectedDisputeId(null)}
        dispute={activeDispute}
      />
    </AdminLayout>
  );
}
