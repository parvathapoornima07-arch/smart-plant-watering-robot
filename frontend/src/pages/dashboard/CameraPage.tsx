import { Camera, Clock, ImageOff } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DemoBanner } from "@/components/common/DemoBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDashboard } from "@/contexts/DashboardContext";
import { useDeviceData } from "@/hooks/useDeviceData";
import { listImages } from "@/services/camera.service";
import { useEffect, useState } from "react";
import type { CameraImage } from "@/types";

export function CameraPage() {
  const { demoMode, exitDemo, activeDeviceId, connectionMode, activeDevice } = useDashboard();
  const { latestImage, loading } = useDeviceData();
  const [history, setHistory] = useState<CameraImage[]>([]);

  useEffect(() => {
    if (demoMode || !activeDeviceId) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    listImages(activeDeviceId, { pageSize: 12 })
      .then((res) => {
        if (!cancelled) setHistory(res.data);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activeDeviceId, demoMode]);

  return (
    <>
      <DashboardHeader
        title="Camera"
        description="Periodic photos from the ESP32-CAM, when capture and upload are implemented."
      />
      {demoMode ? <div className="mb-6"><DemoBanner onExit={exitDemo} /></div> : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge mode={connectionMode} />
        <span className="inline-flex items-center gap-1 text-xs text-charcoal-500">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {activeDevice?.lastSeenAt ? `Device last seen ${new Date(activeDevice.lastSeenAt).toLocaleString()}` : "No heartbeat recorded"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Latest image" />
          <CardBody>
            {loading && !latestImage && !demoMode ? (
              <div className="flex aspect-video items-center justify-center rounded-xl bg-charcoal-50 text-charcoal-400">
                <Camera className="h-8 w-8" aria-hidden />
              </div>
            ) : latestImage ? (
              <div>
                {latestImage.publicUrl ? (
                  <img
                    src={latestImage.publicUrl}
                    alt="Latest camera capture"
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-charcoal-50 text-charcoal-400">
                    <ImageOff className="h-8 w-8" aria-hidden />
                  </div>
                )}
                <p className="mt-3 text-xs text-charcoal-500">
                  Captured: {latestImage.capturedAt ? new Date(latestImage.capturedAt).toLocaleString() : "Unavailable"}
                </p>
                <p className="mt-1 text-xs text-charcoal-400">
                  Received: {new Date(latestImage.receivedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={<Camera className="h-8 w-8" />}
                title="No image available"
                description="Camera capture, transfer, and upload must be implemented in firmware and the ingestion pipeline. Until then, this stays empty rather than showing fabricated images."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="How camera upload works" />
          <CardBody className="text-sm text-charcoal-600">
            <p>
              The intended mode is periodic photo capture roughly every 30–60 seconds. The
              serial bridge only forwards bytes — it does <strong>not</strong> capture or upload images.
            </p>
            <p className="mt-3">
              Camera capture, image transfer, backend ingestion, and storage upload are separate steps
              that must be implemented. Image upload endpoints are authenticated at the device level.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Image history" />
        <CardBody>
          {history.length === 0 ? (
            <EmptyState icon={<ImageOff className="h-8 w-8" />} title="No images yet" description="Captured images will be listed here once ingestion is enabled." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {history.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-xl border border-leaf-100">
                  {img.publicUrl ? (
                    <img src={img.publicUrl} alt="Camera capture" className="aspect-video w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-charcoal-50 text-charcoal-400">
                      <ImageOff className="h-6 w-6" aria-hidden />
                    </div>
                  )}
                  <p className="px-3 py-2 text-xs text-charcoal-500">
                    {img.capturedAt ? new Date(img.capturedAt).toLocaleString() : "Timestamp unavailable"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
