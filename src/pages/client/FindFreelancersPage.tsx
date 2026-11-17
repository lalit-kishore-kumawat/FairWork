import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Plus } from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { PrototypeNotice } from '@/src/components/common/PrototypeNotice';
import { Avatar } from '@/src/components/common/Avatar';
import { CreateProjectModal } from '@/src/components/projects/CreateProjectModal';
import { useAppData } from '@/src/context/AppDataContext';

export function FindFreelancersPage() {
  const { users } = useAppData();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const activeFreelancers = users.filter(
    (u) => u.role === 'freelancer' && u.status === 'Active'
  );

  return (
    <DashboardLayout
      title="Find Freelancers"
      breadcrumb="Client Workspace · Talent Directory Preview"
      primaryAction={
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" />
          <span>Invite by Email</span>
        </button>
      }
    >
      <div className="space-y-6">
        <PrototypeNotice
          title="Future Functionality Preview"
          message="The public FairWork Freelancer Discovery Directory is planned for Phase 2 backend release. In this prototype, you can preview sample contractor profiles or invite any freelancer directly by email when creating a project agreement."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {activeFreelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-6"
            >
              <div>
                <div className="flex items-start gap-4">
                  <Avatar
                    name={freelancer.name}
                    src={freelancer.avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-base font-semibold text-[#0F172A]">
                      {freelancer.name}
                    </h2>
                    <p className="text-sm text-[#64748B]">{freelancer.title}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#64748B]">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{freelancer.location}</span>
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
                  {freelancer.bio}
                </p>

                <p className="mt-4 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#0F172A]">Skills: </span>
                  {freelancer.skills.join(' · ')}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Available for milestone agreements</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  Create Project Invitation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/projects/${id}`)}
      />
    </DashboardLayout>
  );
}
