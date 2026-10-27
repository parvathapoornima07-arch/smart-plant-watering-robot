import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Info, Save, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Badge } from "@/components/ui/Badge";
import { useDashboard } from "@/contexts/DashboardContext";
import { useDeviceData } from "@/hooks/useDeviceData";
import { useToast } from "@/contexts/ToastContext";
import { saveCalibration } from "@/services/calibration.service";
import { isValidAdcValue } from "@/lib/moisture";

export function CalibrationPage() {
  const { demoMode, exitDemo, activeDeviceId, connectionMode } = useDashboard();
  const { calibration, refresh } = useDeviceData();
  const toast = useToast();

  const [dry, setDry] = useState<string>("");
  const [wet, setWet] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("35");
  const [saving, setSaving] = useState(false);

  // Pre-fill from existing calibration (real or demo).
  useEffect(() => {
    if (calibration) {
      setDry(String(calibration.dryReference));
      setWet(String(calibration.wetReference));
      setThreshold(String(calibration.wateringThreshold));
    }
  }, [calibration]);

  const dryNum = Number(dry);
  const wetNum = Number(wet);
  const thresholdNum = Number(threshold);

  const validation = useMemo(() => {
    const issues: string[] = [];
    if (!isValidAdcValue(dryNum)) issues.push("Dry reference must be an integer in 0–4095.");
    if (!isValidAdcValue(wetNum)) issues.push("Wet reference must be an integer in 0–4095.");
    if (isValidAdcValue(dryNum) && isValidAdcValue(wetNum) && dryNum === wetNum)
      issues.push("Dry and wet references must differ.");
    if (!Number.isFinite(thresholdNum) || thresholdNum < 0 || thresholdNum > 100)
      issues.push("Watering threshold must be between 0 and 100.");
    return { valid: issues.length === 0, issues };
  }, [dryNum, wetNum, thresholdNum]);

  const difference = isValidAdcValue(dryNum) && isValidAdcValue(wetNum) ? Math.abs(wetNum - dryNum) : null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;
    if (!activeDeviceId) {
      toast.error("Select a device first, or this device has no ID yet.");
      return;
    }
    if (demoMode) {
      toast.info("Demo mode is read-only. Exit demo mode to save calibration against a real device.");
      return;
    }
    setSaving(true);
    try {
      await saveCalibration(activeDeviceId, {
        dryReference: Math.round(dryNum),
        wetReference: Math.round(wetNum),
        wateringThreshold: thresholdNum,
        manualEntry: true, // Manually entered from the Serial Monitor averages.
      });
      toast.success("Calibration saved.");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save calibration.");
    } finally {
      setSaving(false);
    }
  };

  const readOnly = demoMode;

  return (
    <>
      <DashboardHeader
        title="Calibration"
        description="Record dry and wet reference averages to map raw ADC values to a moisture percentage."
      />
      {demoMode ? <div className="mb-6"><DemoBanner onExit={exitDemo} /></div> : null}

      <Card className="mb-6">
        <CardHeader title="How to take reference readings" />
        <CardBody>
          <div className="flex items-start gap-3 rounded-xl bg-leaf-50/60 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" aria-hidden />
            <div className="text-sm text-charcoal-700">
              <p className="font-medium text-charcoal-800">Firmware process</p>
              <p className="mt-1">
                The sensor test sketch takes <strong>20 readings with a 300 ms delay</strong> between each and
                prints the average to the Arduino Serial Monitor. Open the Serial Monitor, send{" "}
                <code className="rounded bg-white px-1 py-0.5 text-xs">D</code> with dry sand to get the dry
                average, then send <code className="rounded bg-white px-1 py-0.5 text-xs">W</code> with wet sand
                to get the wet average.
              </p>
              <p className="mt-2 text-amber-700">
                A browser cannot run those Serial commands on the ESP32 directly. Enter the printed averages
                below — this is recorded as manually entered calibration data.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Reference values"
            action={calibration?.manualEntry ? <Badge tone="demo">Manually entered</Badge> : undefined}
          />
          <CardBody>
            <form onSubmit={onSave} className="space-y-4" noValidate>
              <Input
                label="Dry-sand reference (average)"
                name="dry"
                type="number"
                min={0}
                max={4095}
                step={1}
                inputMode="numeric"
                value={dry}
                onChange={(e) => setDry(e.target.value)}
                hint="The average printed after sending 'D' with dry sand (0% anchor)."
                disabled={readOnly}
              />
              <Input
                label="Wet-sand reference (average)"
                name="wet"
                type="number"
                min={0}
                max={4095}
                step={1}
                inputMode="numeric"
                value={wet}
                onChange={(e) => setWet(e.target.value)}
                hint="The average printed after sending 'W' with wet sand (100% anchor)."
                disabled={readOnly}
              />
              <Input
                label="Watering threshold (%)"
                name="threshold"
                type="number"
                min={0}
                max={100}
                step={1}
                inputMode="numeric"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                hint="Trigger watering when the calibrated moisture estimate falls below this percentage."
                disabled={readOnly}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={saving} disabled={readOnly || connectionMode === "offline"}>
                  <Save className="h-4 w-4" aria-hidden /> Save calibration
                </Button>
                {!validation.valid ? (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4" aria-hidden /> {validation.issues[0]}
                  </span>
                ) : null}
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Summary" />
            <CardBody className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-charcoal-500">Dry reference</p>
                <p className="font-medium text-charcoal-900">{isValidAdcValue(dryNum) ? dryNum : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Wet reference</p>
                <p className="font-medium text-charcoal-900">{isValidAdcValue(wetNum) ? wetNum : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Difference</p>
                <p className="font-medium text-charcoal-900">{difference != null ? difference : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Threshold</p>
                <p className="font-medium text-charcoal-900">{Number.isFinite(thresholdNum) ? `${thresholdNum}%` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Validation</p>
                {validation.valid ? (
                  <Badge tone="success">Valid</Badge>
                ) : (
                  <Badge tone="warning">Invalid</Badge>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-start gap-3">
              <SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-charcoal-400" aria-hidden />
              <p className="text-xs text-charcoal-500">
                The percentage is a calibrated estimate, not a lab soil-water measurement. Polarity is handled
                automatically — both sensors that read higher-when-dry and higher-when-wet work with the same formula.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
