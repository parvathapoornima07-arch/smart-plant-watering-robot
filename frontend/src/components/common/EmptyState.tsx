import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-leaf-200 bg-leaf-50/50 px-6 py-10 text-center">
      {icon ? <div className="text-leaf-500" aria-hidden>{icon}</div> : null}
      <div>
        <p className="text-sm font-semibold text-charcoal-800">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-charcoal-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
