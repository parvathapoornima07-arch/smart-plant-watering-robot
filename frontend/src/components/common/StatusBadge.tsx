import { cn } from "@/lib/cn";
import type { ConnectionMode } from "@/types";

interface StatusBadgeProps {
  mode: ConnectionMode;
  className?: string;
}

/**
 * Renders a device connection status pill: Live device / Demo data / Offline.
 * Demo data is ALWAYS visually distinct (amber) so it is never mistaken for
 * a live hardware reading.
 */
export function StatusBadge({ mode, className }: StatusBadgeProps) {
  const config: Record<ConnectionMode, { label: string; dot: string; tone: string }> = {
    live: {
      label: "Live device",
      dot: "bg-leaf-500 animate-pulse-soft",
      tone: "bg-leaf-50 text-leaf-700 ring-1 ring-leaf-200",
    },
    demo: {
      label: "Demo data",
      dot: "bg-amber-500",
      tone: "bg-amber-50 text-amber-800 ring-1 ring-amber-300",
    },
    offline: {
      label: "Offline",
      dot: "bg-charcoal-400",
      tone: "bg-charcoal-100 text-charcoal-600 ring-1 ring-charcoal-200",
    },
  };
  const c = config[mode];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        c.tone,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", c.dot)} aria-hidden />
      {c.label}
    </span>
  );
}
