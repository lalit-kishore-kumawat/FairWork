import { Info } from 'lucide-react';

interface PrototypeNoticeProps {
  title?: string;
  message: string;
  className?: string;
}

export function PrototypeNotice({
  title = 'Prototype Data Notice',
  message,
  className = '',
}: PrototypeNoticeProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm ${className}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
      <div>
        <span className="font-semibold text-[#0F172A]">{title}: </span>
        <span className="text-[#64748B]">{message}</span>
      </div>
    </div>
  );
}
