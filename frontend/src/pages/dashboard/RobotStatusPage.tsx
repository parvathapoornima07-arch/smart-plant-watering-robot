import { Bot, Battery, Cpu, Radio, Droplet, Power, Activity, Wifi, HelpCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DemoBanner } from "@/components/common/DemoBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { useDashboard } from "@/contexts/DashboardContext";
import { useDeviceData } from "@/hooks/useDeviceData";

function renderNullableState(value: boolean | null | undefined, onLabel = "On", offLabel = "Off") {
  if (value === null || value === undefined) {
    return { text: "Not reported", hint: "Firmware has not reported this", unknown: true };
  }
  return { text: value ? onLabel : offLabel, hint: "Last reported state", unknown: false };
}

export function RobotStatusPage() {
  const { demoMode, exitDemo, activeDevice, connectionMode } = useDashboard();
  const { latestReading, events, loading } = useDeviceData();

  const motorState = renderNullableState(latestReading?.motorState, "Running", "Idle");
  const pumpState = renderNullableState(latestReading?.pumpState, "On", "Off");
  // Battery status is only meaningful if the hardware includes a measurement
  // circuit. We deliberately do NOT invent a battery percentage here.
  const batteryAvailable = false; // No measurement circuit confirmed.

  return (
    <>
      <DashboardHeader
        title="Robot status"
        description="Device identity and the states it has actually reported."
      />
      {demoMode ? <div className="mb-6"><DemoBanner onExit={exitDemo} /></div> : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge mode={connectionMode} />
        {activeDevice?.firmwareVersion ? (
          <Badge tone="neutral">Firmware {activeDevice.firmwareVersion}</Badge>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Cpu className="h-5 w-5" aria-hidden />}
          label="Device ID"
          value={activeDevice?.deviceId ?? (demoMode ? "demo-device-001" : "—")}
          hint={activeDevice?.name ? activeDevice.name : "Not registered"}
        />
        <StatCard
          icon={<Radio className="h-5 w-5" aria-hidden />}
          label="Connection state"
          value={<StatusBadge mode={connectionMode} />}
          hint={activeDevice?.lastSeenAt ? `Last seen ${new Date(activeDevice.lastSeenAt).toLocaleString()}` : "No heartbeat recorded"}
          tone={connectionMode === "live" ? "live" : connectionMode === "demo" ? "demo" : "neutral"}
        />
        <StatCard
          icon={<Power className="h-5 w-5" aria-hidden />}
          label="Last heartbeat"
          value={activeDevice?.lastSeenAt ? new Date(activeDevice.lastSeenAt).toLocaleTimeString() : "—"}
          hint={activeDevice?.lastSeenAt ? new Date(activeDevice.lastSeenAt).toLocaleDateString() : "No heartbeat recorded"}
        />
        <StatCard
          icon={<Bot className="h-5 w-5" aria-hidden />}
          label="Motor status"
          value={motorState.text}
          hint={motorState.hint}
          tone={motorState.unknown ? "neutral" : "live"}
        />
        <StatCard
          icon={<Droplet className="h-5 w-5" aria-hidden />}
          label="Pump status"
          value={pumpState.text}
          hint={pumpState.hint}
          tone={pumpState.unknown ? "neutral" : "live"}
        />
        <StatCard
          icon={<Battery className="h-5 w-5" aria-hidden />}
          label="Battery status"
          value={batteryAvailable ? "—" : "Unavailable"}
          hint={batteryAvailable ? "Measured by hardware" : "Requires a measurement circuit not present in this build"}
          tone="neutral"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Latest device event" />
          <CardBody>
            {events.length === 0 && !loading ? (
              <EmptyState icon={<Activity className="h-8 w-8" />} title="No events reported" description="Events from the device will appear here when firmware sends them." />
            ) : events.length > 0 ? (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-leaf-400" aria-hidden />
                <div>
                  <p className="text-sm text-charcoal-800">{events[0].message}</p>
                  <p className="text-xs text-charcoal-400">
                    {events[0].eventType} · {new Date(events[0].createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-charcoal-400">Loading…</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Why some states are unknown" />
          <CardBody className="flex items-start gap-3 text-sm text-charcoal-600">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-charcoal-400" aria-hidden />
            <p>
              Motor, pump, and battery states are shown only when the device actually reports them.
              We never invent battery percentages or actuator states. When a value isn't reported,
              you'll see "Not reported" instead of a guess.
            </p>
          </CardBody>
        </Card>
      </div>

      {connectionMode === "offline" ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-charcoal-200 bg-charcoal-50 p-4">
          <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-charcoal-500" aria-hidden />
          <p className="text-sm text-charcoal-600">
            This device is not currently connected. Once firmware is updated to report to the backend, status
            and heartbeat will update here automatically. See the device integration guide in the README.
          </p>
        </div>
      ) : null}
    </>
  );
}
