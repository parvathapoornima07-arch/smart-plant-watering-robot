import { Link } from "react-router-dom";
import { Droplets, Droplet, Gauge, Wifi, Clock, Camera, Activity, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DemoBanner } from "@/components/common/DemoBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { useDashboard } from "@/contexts/DashboardContext";
import { useDeviceData } from "@/hooks/useDeviceData";
import { computeMoisturePercentage, interpretMoisture } from "@/lib/moisture";

export function DashboardOverview() {
  const { demoMode, exitDemo, activeDevice, connectionMode } = useDashboard();
  const { latestReading, calibration, events, latestImage, loading } = useDeviceData();

  if (loading && !demoMode && !latestReading) {
    return (
      <>
        <DashboardHeader title="Dashboard overview" description="At-a-glance status for your robot." />
        <PageLoader label="Loading device data…" />
      </>
    );
  }

  const moisture = latestReading && calibration
    ? computeMoisturePercentage(latestReading.rawMoistureValue, calibration)
    : null;
  const moistureInterpret = moisture?.valid ? interpretMoisture(moisture.percentage) : null;

  const lastUpdate = latestReading?.deviceTimestamp ?? latestReading?.receivedAt ?? null;
  const formattedLastUpdate = lastUpdate ? new Date(lastUpdate).toLocaleString() : null;

  return (
    <>
      <DashboardHeader title="Dashboard overview" description="At-a-glance status for your robot." />
      {demoMode ? <div className="mb-6"><DemoBanner onExit={exitDemo} /></div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Droplets className="h-5 w-5" aria-hidden />}
          label="Soil sensor"
          value={latestReading ? latestReading.rawMoistureValue : "—"}
          hint={latestReading ? "Raw ADC value (0–4095)" : "No reading yet"}
          tone={demoMode ? "demo" : "live"}
        />
        <StatCard
          icon={<Gauge className="h-5 w-5" aria-hidden />}
          label="Moisture status"
          value={moisture?.valid ? `${moisture.percentage}%` : "Uncalibrated"}
          hint={moistureInterpret ? moistureInterpret.label : "Calibration required"}
          tone={demoMode ? "demo" : moisture?.valid ? "live" : "neutral"}
        />
        <StatCard
          icon={<Droplet className="h-5 w-5" aria-hidden />}
          label="Water pump"
          value={latestReading?.pumpState === null || latestReading?.pumpState === undefined ? "Unknown" : latestReading.pumpState ? "On" : "Off"}
          hint={latestReading?.pumpState === null || latestReading?.pumpState === undefined ? "Not reported by firmware" : "Last reported state"}
        />
        <StatCard
          icon={<Wifi className="h-5 w-5" aria-hidden />}
          label="Connectivity"
          value={<StatusBadge mode={connectionMode} />}
          hint={activeDevice?.lastSeenAt ? `Last seen ${new Date(activeDevice.lastSeenAt).toLocaleString()}` : "No heartbeat recorded"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Latest camera image" action={<Link to="/dashboard/camera" className="text-xs font-medium text-leaf-700 hover:underline">View</Link>} />
          <CardBody>
            {latestImage ? (
              <div>
                {latestImage.publicUrl ? (
                  <img src={latestImage.publicUrl} alt="Latest camera capture" className="w-full rounded-xl" />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-charcoal-50 text-charcoal-400">
                    <Camera className="h-8 w-8" aria-hidden />
                  </div>
                )}
                <p className="mt-2 text-xs text-charcoal-500">
                  {latestImage.capturedAt ? `Captured ${new Date(latestImage.capturedAt).toLocaleString()}` : "Timestamp unavailable"}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={<Camera className="h-8 w-8" />}
                title="No image available"
                description="Camera capture and upload require firmware support. Until then, this stays empty."
              />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent system events"
            action={<Link to="/dashboard/robot" className="text-xs font-medium text-leaf-700 hover:underline">All events</Link>}
          />
          <CardBody>
            {events.length === 0 ? (
              <EmptyState icon={<Activity className="h-8 w-8" />} title="No events yet" description="System events will appear here once the device reports them." />
            ) : (
              <ul className="divide-y divide-leaf-50">
                {events.slice(0, 8).map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3 py-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-leaf-400" aria-hidden />
                    <div className="flex-1">
                      <p className="text-sm text-charcoal-800">{ev.message}</p>
                      <p className="text-xs text-charcoal-400">
                        {ev.eventType} · {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-leaf-100 bg-white p-4">
        <Clock className="h-5 w-5 text-charcoal-400" aria-hidden />
        <p className="text-sm text-charcoal-600">
          <span className="font-medium text-charcoal-800">Last sensor update:</span>{" "}
          {formattedLastUpdate ?? "No reading received yet"}
        </p>
        <Link to="/dashboard/soil" className="ml-auto">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-leaf-700 hover:underline">
            Go to soil monitoring <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      </div>

      {demoMode ? (
        <p className="mt-4 text-xs text-amber-700">
          Showing demo sample data. These values are not from a real device and are never stored.
        </p>
      ) : null}
    </>
  );
}
