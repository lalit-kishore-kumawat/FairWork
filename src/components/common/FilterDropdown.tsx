import { ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className = '',
}: FilterDropdownProps) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {label && (
        <span className="mr-2 whitespace-nowrap text-xs font-medium text-[#64748B]">
          {label}
        </span>
      )}
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || 'Filter'}
          className="h-10 w-full appearance-none rounded-lg border border-[#E2E8F0] bg-white pl-3 pr-9 text-sm font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
