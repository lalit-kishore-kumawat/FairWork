import React from 'react';
import { motion } from 'motion/react';

interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'neutral',
}: MetricCardProps) {
  const iconTone =
    tone === 'primary'
      ? 'bg-blue-50 text-[#2563EB] border-blue-100'
      : tone === 'success'
        ? 'bg-emerald-50 text-[#16A34A] border-emerald-100'
        : tone === 'warning'
          ? 'bg-amber-50 text-[#F59E0B] border-amber-100'
          : tone === 'danger'
            ? 'bg-red-50 text-[#DC2626] border-red-100'
            : 'bg-slate-50 text-[#0F172A] border-[#E2E8F0]';

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#64748B]">{label}</p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${iconTone}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums">
        {value}
      </p>
      {helper && <p className="mt-1 text-xs text-[#64748B]">{helper}</p>}
    </motion.div>
  );
}
