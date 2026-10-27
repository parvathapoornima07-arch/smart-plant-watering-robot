import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { getAdminEvents } from "@/services/admin.service";
import type { DeviceEvent } from "@/types";

export function AdminEvents() {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminEvents({ pageSize: 50 });
      setEvents(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading && events.length === 0) return <PageLoader label="Loading events…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="text-xl font-bold text-charcoal-900">System events</h1>
      <p className="mt-1 text-sm text-charcoal-500">Recent device events across the platform.</p>

      <Card className="mt-6">
        <CardBody>
          {events.length === 0 ? (
            <EmptyState icon={<Activity className="h-8 w-8" />} title="No events yet" description="Device events will appear here once devices report them." />
          ) : (
            <ul className="divide-y divide-leaf-50">
              {events.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-leaf-400" aria-hidden />
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-800">{ev.message}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-charcoal-400">
                      <Badge tone="neutral">{ev.eventType}</Badge>
                      <span>Device: {ev.deviceId}</span>
                      <span>{new Date(ev.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
