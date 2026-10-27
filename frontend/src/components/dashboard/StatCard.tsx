import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card, CardBody } from "@/components/ui/Card";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "live" | "demo" | "warning";
  className?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "bg-charcoal-50 text-charcoal-600",
  live: "bg-leaf-50 text-leaf-700",
  demo: "bg-amber-50 text-amber-700",
  warning: "bg-amber-50 text-amber-700",
};

export function StatCard({ icon, label, value, hint, tone = "neutral", className }: StatCardProps) {
  return (
    <Card className={cn("transition hover:shadow-cardHover", className)}>
      <CardBody>
        <div className="flex items-center justify-between">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneClasses[tone])}>
            {icon}
          </span>
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-charcoal-400">{label}</p>
        <p className="mt-1 text-xl font-bold text-charcoal-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-charcoal-500">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
