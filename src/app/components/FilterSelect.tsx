"use client";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "すべて",
  className = "",
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
