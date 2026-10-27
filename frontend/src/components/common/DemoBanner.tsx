import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DemoBannerProps {
  onExit: () => void;
}

/**
 * Persistent banner shown whenever the dashboard is in demo mode. Demo data is
 * in-memory sample data only — never persisted, never sent to the backend.
 */
export function DemoBanner({ onExit }: DemoBannerProps) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="text-sm">
          <span className="font-semibold">Demo mode.</span> The values below are
          sample data for previewing the dashboard. They are not from a real
          device and are never stored.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onExit} className="shrink-0">
        Exit demo mode
      </Button>
    </div>
  );
}
