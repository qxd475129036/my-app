"use client";

export interface Action {
  label: string;
  onClick: () => void;
  variant?: "primary" | "danger" | "outline";
  icon?: React.ReactNode;
}

export interface ActionBarProps {
  selectedCount: number;
  actions: Action[];
  onClearSelection: () => void;
}

export function ActionBar({
  selectedCount,
  actions,
  onClearSelection,
}: ActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-accent-light px-4 py-3 animate-slideUp">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-accent">
          {selectedCount}件選択中
        </span>
        <button
          onClick={onClearSelection}
          className="text-xs text-muted hover:text-foreground underline transition-colors"
        >
          選択解除
        </button>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, i) => {
          const base =
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";
          const variantClass =
            action.variant === "danger"
              ? "bg-danger text-white hover:bg-red-700"
              : action.variant === "outline"
              ? "border border-border bg-white text-foreground hover:bg-gray-50"
              : "bg-accent text-white hover:bg-accent-hover";
          return (
            <button
              key={i}
              onClick={action.onClick}
              className={`${base} ${variantClass}`}
            >
              {action.icon}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
