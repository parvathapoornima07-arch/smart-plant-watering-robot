import { Droplets, Gauge, Clock, SlidersHorizontal, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReadingsChart } from "@/components/dashboard/ReadingsChart";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DemoBanner } from "@/components/common/DemoBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboard } from "@/contexts/DashboardContext";
import { useDeviceData } from "@/hooks/useDeviceData";
import { computeMoisturePercentage, interpretMoisture, ADC_MIN, ADC_MAX } from "@/lib/moisture";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function SoilMoisturePage() {
  const { demoMode, exitDemo } = useDashboard();
  const { latestReading, calibration, readings, loading, error, refresh } = useDeviceData();

  const moisture = latestReading && calibration
    ? computeMoisturePercentage(latestReading.rawMoistureValue, calibration)
    : null;
  const interp = moisture?.valid ? interpretMoisture(moisture.percentage) : null;
  const lastUpdate = latestReading?.deviceTimestamp ?? latestReading?.receivedAt ?? null;

  return (
    <>
      <DashboardHeader
        title="Soil moisture"
        description="Raw ADC readings from the ESP32's GPIO 36, with a calibrated moisture estimate."
      />
      {demoMode ? <div className="mb-6"><DemoBanner onExit={exitDemo} /></div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Droplets className="h-5 w-5" aria-hidden />}
          label="Raw ADC reading"
          value={latestReading ? latestReading.rawMoistureValue : "—"}
          hint={`12-bit ADC range ${ADC_MIN}–${ADC_MAX}`}
          tone={demoMode ? "demo" : "live"}
        />
        <StatCard
          icon={<Gauge className="h-5 w-5" aria-hidden />}
          label="Moisture estimate"
          value={moisture?.valid ? `${moisture.percentage}%` : "—"}
          hint={moisture?.valid ? (interp?.label ?? "") : moisture?.reason ?? "Calibration required"}
          tone={demoMode ? "demo" : moisture?.valid ? "live" : "neutral"}
        />
        <StatCard
          icon={<SlidersHorizontal className="h-5 w-5" aria-hidden />}
          label="Watering threshold"
          value={calibration ? `${calibration.wateringThreshold}%` : "—"}
          hint={calibration ? "Configured moisture threshold" : "Not configured"}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Gauge className="h-5 w-5" aria-hidden />}
          label="Dry reference"
          value={calibration ? calibration.dryReference : "—"}
          hint="0% anchor"
        />
        <StatCard
          icon={<Droplets className="h-5 w-5" aria-hidden />}
          label="Wet reference"
          value={calibration ? calibration.wetReference : "—"}
          hint="100% anchor"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" aria-hidden />}
          label="Last update"
          value={lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "—"}
          hint={lastUpdate ? new Date(lastUpdate).toLocaleDateString() : "No reading yet"}
        />
        <StatCard
          icon={<Droplets className="h-5 w-5" aria-hidden />}
          label="Pump state"
          value={latestReading?.pumpState == null ? "Unknown" : latestReading.pumpState ? "On" : "Off"}
          hint={latestReading?.pumpState == null ? "Not reported by firmware" : "Last reported state"}
        />
      </div>

      {calibration ? null : (
        <Card className="mt-6">
          <CardBody>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">Calibration not configured</p>
                  <p className="text-sm text-charcoal-600">
                    Without dry and wet references, a moisture percentage cannot be calculated. The raw ADC value is still shown.
                  </p>
                </div>
              </div>
              <Link to="/dashboard/calibration">
                <Button variant="secondary" size="sm">Configure calibration</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Historical readings"
          description={calibration ? "Raw ADC with dry/wet reference lines and the calibrated moisture estimate." : "Raw ADC over recent readings."}
        />
        <CardBody>
          {error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-charcoal-400">Loading…</div>
          ) : readings.length === 0 ? (
            <EmptyState icon={<Droplets className="h-8 w-8" />} title="No readings yet" description="Readings will appear here once the device reports them." />
          ) : (
            <ReadingsChart readings={readings} calibration={calibration} />
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-xs text-charcoal-400">
        The moisture percentage is a calibrated estimate derived from your dry/wet references,
        not a laboratory soil-water measurement. A higher ADC value does not always mean wetter
        soil — polarity depends on your sensor.
      </p>
    </>
  );
}
