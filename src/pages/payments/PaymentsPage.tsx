import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, CreditCard, Wallet } from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { MetricCard } from '@/src/components/dashboard/MetricCard';
import { PrototypeNotice } from '@/src/components/common/PrototypeNotice';
import { SearchInput } from '@/src/components/common/SearchInput';
import { FilterDropdown } from '@/src/components/common/FilterDropdown';
import { DataTable, DataTableColumn } from '@/src/components/common/DataTable';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { PaymentRecord, PaymentStatus } from '@/src/types';
import { formatCurrency, formatDate } from '@/src/utils/formatters';

const PAYMENT_STATUSES: Array<'All' | PaymentStatus> = [
  'All',
  'Pending',
  'Processing',
  'Successful',
  'Failed',
  'Refunded',
  'Disputed',
];

export function PaymentsPage() {
  const { currentUser } = useAuth();
  const { projects, payments } = useAppData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');

  const isFreelancer = currentUser?.role === 'freelancer';

  const scopedProjects = projects.filter((p) =>
    isFreelancer
      ? p.freelancerId === currentUser?.id || currentUser?.id === 'usr-freelancer-1'
      : p.clientId === currentUser?.id || currentUser?.id === 'usr-client-1'
  );

  const scopedPayments = useMemo(() => {
    return payments
      .filter((pay) =>
        isFreelancer
          ? pay.freelancerId === currentUser?.id || currentUser?.id === 'usr-freelancer-1'
          : pay.clientId === currentUser?.id || currentUser?.id === 'usr-client-1'
      )
      .filter((pay) => {
        const matchesSearch =
          !search.trim() ||
          pay.projectName.toLowerCase().includes(search.toLowerCase()) ||
          pay.milestoneTitle.toLowerCase().includes(search.toLowerCase()) ||
          pay.reference.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [payments, currentUser, isFreelancer, search, statusFilter]);

  const totalProjectBudget = scopedProjects
    .filter((p) => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + p.budget, 0);

  const amountPaid = scopedPayments
    .filter((p) => p.status === 'Successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = scopedPayments
    .filter((p) => p.status === 'Pending' || p.status === 'Processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const releasedPayments = amountPaid;

  const columns: DataTableColumn<PaymentRecord>[] = [
    {
      key: 'project',
      header: 'Project Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-[#0F172A]">{row.projectName}</p>
          <p className="text-xs text-[#64748B]">{row.providerLabel}</p>
        </div>
      ),
    },
    {
      key: 'milestone',
      header: 'Milestone',
      render: (row) => <span className="text-sm text-[#0F172A]">{row.milestoneTitle}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Transaction Reference',
      render: (row) => (
        <span className="font-mono text-xs text-[#64748B] tabular-nums">{row.reference}</span>
      ),
    },
    {
      key: 'date',
      header: 'Payment Date',
      render: (row) => (
        <span className="font-mono text-xs text-[#64748B] tabular-nums">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DashboardLayout
      title={isFreelancer ? 'Earnings & Payment Ledger' : 'Payments & Ledger'}
      breadcrumb={`${isFreelancer ? 'Freelancer' : 'Client'} Workspace · Financials`}
    >
      <div className="space-y-6">
        <PrototypeNotice
          title="Prototype Payment Ledger (Mock Data Only)"
          message="This frontend prototype displays simulated milestone payment records for UI verification. FairWork does not process live transactions or represent these mock records as verified escrow funds; production settlement relies on verified backend payment-provider webhooks."
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Project Budget"
            value={formatCurrency(totalProjectBudget)}
            helper="Active & completed agreements"
            icon={<Wallet className="h-4 w-4" />}
            tone="neutral"
          />
          <MetricCard
            label="Amount Paid (Mock)"
            value={formatCurrency(amountPaid)}
            helper="Records marked Successful"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="success"
          />
          <MetricCard
            label="Pending Payments"
            value={formatCurrency(pendingPayments)}
            helper="Pending or Processing records"
            icon={<Clock className="h-4 w-4" />}
            tone="warning"
          />
          <MetricCard
            label="Released Payments (Mock)"
            value={formatCurrency(releasedPayments)}
            helper="Simulated ledger settlements"
            icon={<CreditCard className="h-4 w-4" />}
            tone="primary"
          />
        </section>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by project, milestone, or transaction reference..."
            className="w-full sm:max-w-sm"
          />
          <FilterDropdown
            label="Payment Status"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'All' | PaymentStatus)}
            options={PAYMENT_STATUSES.map((s) => ({ label: s, value: s }))}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={scopedPayments}
          rowKey={(r) => r.id}
          emptyState={
            <EmptyState
              title="No payment records match your filter"
              description="Try clearing your search input or switching the payment status filter."
            />
          }
        />
      </div>
    </DashboardLayout>
  );
}
