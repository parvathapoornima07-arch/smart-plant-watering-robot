import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-charcoal-500", className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label ? <span className="text-sm">{label}</span> : null}
      <span className="sr-only">Loading…</span>
    </span>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
