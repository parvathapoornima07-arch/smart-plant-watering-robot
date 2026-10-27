import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  const { connectionMode, demoMode, enableDemo, exitDemo, devices, activeDeviceId, setActiveDeviceId, loading } =
    useDashboard();

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-charcoal-500">{description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge mode={connectionMode} />
          {actions}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!demoMode && devices.length > 0 ? (
          <label className="text-xs text-charcoal-500">
            Device:
            <select
              className="ml-2 rounded-lg border border-charcoal-200 bg-white px-2 py-1 text-sm"
              value={activeDeviceId ?? ""}
              onChange={(e) => setActiveDeviceId(e.target.value)}
              disabled={loading}
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.name} ({d.deviceId})
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!demoMode && devices.length === 0 && !loading ? (
          <Button variant="secondary" size="sm" onClick={enableDemo}>
            <FlaskConical className="h-4 w-4" aria-hidden /> Try demo mode
          </Button>
        ) : null}
        {demoMode ? (
          <Button variant="secondary" size="sm" onClick={exitDemo}>
            Exit demo mode
          </Button>
        ) : null}
      </div>
    </div>
  );
}
