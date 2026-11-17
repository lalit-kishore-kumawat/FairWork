import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { SearchInput } from '@/src/components/common/SearchInput';
import { FilterDropdown } from '@/src/components/common/FilterDropdown';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { EmptyState } from '@/src/components/common/EmptyState';
import { DataTable, DataTableColumn } from '@/src/components/common/DataTable';
import { ProjectCard } from '@/src/components/projects/ProjectCard';
import { CreateProjectModal } from '@/src/components/projects/CreateProjectModal';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { Project, ProjectStatus } from '@/src/types';
import {
  calculateProjectCompletion,
  formatCurrency,
  formatDate,
} from '@/src/utils/formatters';

const STATUS_OPTIONS: Array<'All' | ProjectStatus> = [
  'All',
  'Draft',
  'Awaiting Acceptance',
  'Active',
  'In Review',
  'Disputed',
  'Completed',
  'Cancelled',
];

interface ProjectsListPageProps {
  defaultStatusFilter?: 'All' | ProjectStatus;
  pageTitle?: string;
}

export function ProjectsListPage({
  defaultStatusFilter = 'All',
  pageTitle,
}: ProjectsListPageProps) {
  const { currentUser } = useAuth();
  const { projects, milestones } = useAppData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>(defaultStatusFilter);
  const [sortBy, setSortBy] = useState<'deadline_asc' | 'deadline_desc' | 'budget_desc' | 'budget_asc'>('deadline_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);

  const isFreelancer = currentUser?.role === 'freelancer';

  const scopedProjects = useMemo(() => {
    const base = isFreelancer
      ? projects.filter(
          (p) =>
            p.freelancerId === currentUser?.id ||
            p.freelancerEmail.toLowerCase() === currentUser?.email.toLowerCase() ||
            currentUser?.id === 'usr-freelancer-1'
        )
      : projects.filter(
          (p) => p.clientId === currentUser?.id || currentUser?.id === 'usr-client-1'
        );

    const filtered = base.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.freelancerName.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'deadline_asc') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'deadline_desc') {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      if (sortBy === 'budget_desc') return b.budget - a.budget;
      return a.budget - b.budget;
    });
  }, [projects, currentUser, isFreelancer, search, statusFilter, sortBy]);

  const columns: DataTableColumn<Project>[] = [
    {
      key: 'title',
      header: 'Project',
      render: (row) => (
        <div>
          <Link
            to={`/projects/${row.id}`}
            className="font-semibold text-[#0F172A] hover:text-[#2563EB]"
          >
            {row.title}
          </Link>
          <p className="text-xs text-[#64748B]">
            {row.category} · {isFreelancer ? row.clientName : row.freelancerName}
          </p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => {
        const pMs = milestones.filter((m) => m.projectId === row.id);
        return (
          <div className="w-36">
            <ProgressBar value={calculateProjectCompletion(pMs)} />
          </div>
        );
      },
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
      key: 'deadline',
      header: 'Deadline',
      render: (row) => (
        <span className="font-mono text-xs text-[#64748B] tabular-nums">
          {formatDate(row.deadline)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={pageTitle || 'My Projects'}
      breadcrumb={`${isFreelancer ? 'Freelancer' : 'Client'} Workspace · Projects`}
      primaryAction={
        !isFreelancer ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create New Project</span>
          </button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by project title, collaborator, or category..."
            className="w-full lg:max-w-sm"
          />

          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as 'All' | ProjectStatus)}
              options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
            />
            <FilterDropdown
              label="Sort"
              value={sortBy}
              onChange={(val) => setSortBy(val as typeof sortBy)}
              options={[
                { label: 'Deadline (Soonest)', value: 'deadline_asc' },
                { label: 'Deadline (Latest)', value: 'deadline_desc' },
                { label: 'Budget (Highest)', value: 'budget_desc' },
                { label: 'Budget (Lowest)', value: 'budget_asc' },
              ]}
            />
            <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`rounded-md p-2 ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`rounded-md p-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {scopedProjects.length === 0 ? (
          <EmptyState
            title="No matching projects found"
            description="Adjust your search query or status filter, or create a new milestone agreement."
            action={
              statusFilter !== 'All' || search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('All');
                  }}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A]"
                >
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scopedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                milestones={milestones.filter((m) => m.projectId === project.id)}
                counterpartyLabel={isFreelancer ? 'Client' : 'Freelancer'}
                counterpartyName={isFreelancer ? project.clientName : project.freelancerName}
              />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={scopedProjects}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/projects/${r.id}`)}
          />
        )}
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/projects/${id}`)}
      />
    </DashboardLayout>
  );
}
