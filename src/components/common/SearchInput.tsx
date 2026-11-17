import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  ariaLabel = 'Search',
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-[#64748B]"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-9 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 rounded p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
