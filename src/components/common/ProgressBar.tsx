interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  tone = 'primary',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fillColor =
    tone === 'success' || clamped === 100
      ? 'bg-[#16A34A]'
      : tone === 'warning'
        ? 'bg-[#F59E0B]'
        : tone === 'danger'
          ? 'bg-[#DC2626]'
          : 'bg-[#2563EB]';

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label ? <span className="font-medium text-[#64748B]">{label}</span> : <span />}
          {showPercentage && (
            <span className="font-mono font-medium text-[#0F172A] tabular-nums">{clamped}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
