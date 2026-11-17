import { useMemo, useState } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { SearchInput } from '@/src/components/common/SearchInput';
import { FilterDropdown } from '@/src/components/common/FilterDropdown';
import { DataTable, DataTableColumn } from '@/src/components/common/DataTable';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { EmptyState } from '@/src/components/common/EmptyState';
import { RaiseDisputeModal } from '@/src/components/disputes/RaiseDisputeModal';
import { DisputeDetailModal } from '@/src/components/disputes/DisputeDetailModal';
import { useAppData } from '@/src/context/AppDataContext';
import { Dispute } from '@/src/types';
import { formatDate } from '@/src/utils/formatters';

export function DisputesPage() {
  const { disputes } = useAppData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const matchesSearch =
        !search.trim() ||
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.projectName.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()) ||
        d.raisedByName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [disputes, search, statusFilter]);

  const activeDispute = disputes.find((d) => d.id === selectedDisputeId) || null;

  const columns: DataTableColumn<Dispute>[] = [
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
      header: 'Project Name',
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
      key: 'reason',
      header: 'Dispute Reason',
      render: (row) => <span className="text-sm text-[#0F172A]">{row.category}</span>,
    },
    {
      key: 'created',
      header: 'Created Date',
      render: (row) => (
        <span className="font-mono text-xs text-[#64748B] tabular-nums">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DashboardLayout
      title="Dispute Management"
      breadcrumb="Workspace · Evidence-Based Resolution"
      primaryAction={
        <button
          type="button"
          onClick={() => setRaiseOpen(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          <span>Raise Dispute</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by dispute ID, project, or reason..."
            className="w-full sm:max-w-sm"
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All', value: 'All' },
              { label: 'Open', value: 'Open' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Resolved - Client Favored', value: 'Resolved - Client Favored' },
              {
                label: 'Resolved - Freelancer Favored',
                value: 'Resolved - Freelancer Favored',
              },
              {
                label: 'Resolved - Split Settlement',
                value: 'Resolved - Split Settlement',
              },
              { label: 'Closed', value: 'Closed' },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredDisputes}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedDisputeId(r.id)}
          emptyState={
            <EmptyState
              icon={<ShieldAlert className="h-5 w-5" />}
              title="No disputes recorded"
              description="All active agreements are currently proceeding without formal disputes."
            />
          }
        />
      </div>

      <RaiseDisputeModal open={raiseOpen} onClose={() => setRaiseOpen(false)} />
      <DisputeDetailModal
        open={Boolean(activeDispute)}
        onClose={() => setSelectedDisputeId(null)}
        dispute={activeDispute}
      />
    </DashboardLayout>
  );
}
