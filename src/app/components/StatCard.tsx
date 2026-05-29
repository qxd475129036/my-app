export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-card-border bg-card p-5 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[30px] font-bold leading-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? "text-success" : "text-danger"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
