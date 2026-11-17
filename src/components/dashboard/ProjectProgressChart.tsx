import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Milestone, Project } from '@/src/types';
import { calculateProjectCompletion } from '@/src/utils/formatters';

interface ProjectProgressChartProps {
  projects: Project[];
  milestones: Milestone[];
}

export function ProjectProgressChart({ projects, milestones }: ProjectProgressChartProps) {
  const data = projects
    .filter((p) => p.status !== 'Cancelled')
    .slice(0, 6)
    .map((project) => {
      const pMilestones = milestones.filter((m) => m.projectId === project.id);
      const completion = calculateProjectCompletion(pMilestones);
      const completedCount = pMilestones.filter(
        (m) => m.status === 'Approved' || m.status === 'Payment Pending' || m.status === 'Paid'
      ).length;

      return {
        name:
          project.title.length > 20 ? `${project.title.slice(0, 18)}…` : project.title,
        fullTitle: project.title,
        completion,
        milestonesDone: completedCount,
        milestonesTotal: pMilestones.length,
      };
    });

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#64748B]">
        No active project data available to plot.
      </div>
    );
  }

  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 12 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#64748B', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: '#F8FAFC' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
            formatter={(value) => [`${value ?? 0}%`, 'Completion']}
            labelFormatter={(_label, payload) => {
              const item = payload?.[0]?.payload;
              return item
                ? `${item.fullTitle} (${item.milestonesDone}/${item.milestonesTotal} milestones)`
                : '';
            }}
          />
          <Bar dataKey="completion" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
