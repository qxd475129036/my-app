export interface Step {
  label: string;
  status: "completed" | "current" | "pending";
}

export interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  step.status === "completed"
                    ? "bg-accent text-white"
                    : step.status === "current"
                    ? "border-2 border-accent text-accent bg-white"
                    : "border-2 border-border text-muted bg-white"
                }`}
              >
                {step.status === "completed" ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  step.status === "completed"
                    ? "text-accent"
                    : step.status === "current"
                    ? "text-foreground"
                    : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-3 h-px w-8 ${
                  step.status === "completed" ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
