import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Milestone, Project } from '@/src/types';
import { calculateProjectCompletion, formatCurrency, formatDate } from '@/src/utils/formatters';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ProgressBar } from '@/src/components/common/ProgressBar';

interface ProjectCardProps {
  project: Project;
  milestones: Milestone[];
  counterpartyLabel: string;
  counterpartyName: string;
  nextMilestoneTitle?: string;
}

export function ProjectCard({
  project,
  milestones,
  counterpartyLabel,
  counterpartyName,
  nextMilestoneTitle,
}: ProjectCardProps) {
  const completion = calculateProjectCompletion(milestones);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 transition-shadow hover:shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#64748B]">
              {project.category} · {counterpartyLabel}: {counterpartyName}
            </p>
            <h3 className="mt-1 truncate font-display text-base font-semibold text-[#0F172A]">
              {project.title}
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#64748B]">
          {project.summary}
        </p>

        {nextMilestoneTitle && (
          <p className="mt-3 truncate text-xs text-[#0F172A]">
            <span className="font-medium text-[#64748B]">Next milestone: </span>
            {nextMilestoneTitle}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-4 border-t border-[#E2E8F0] pt-4">
        <ProgressBar value={completion} label="Milestone progress" />

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
              {formatCurrency(project.budget)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] tabular-nums">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(project.deadline)}
            </span>
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            <span>View Details</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
