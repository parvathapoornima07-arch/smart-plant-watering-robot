import { useEffect, useState } from "react";
import { Cpu, Activity, Mail, Cog, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { getAdminOverview } from "@/services/admin.service";
import type { AdminOverview as AdminOverviewData, HealthResponse } from "@/types";
import { apiGet } from "@/services/api";

export function AdminOverview() {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, h] = await Promise.allSettled([getAdminOverview(), apiGet<HealthResponse>("/api/health")]);
      if (ov.status === "fulfilled") setOverview(ov.value);
      if (h.status === "fulfilled") setHealth(h.value);
      if (ov.status === "rejected") throw new Error("Failed to load overview.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading && !overview) return <PageLoader label="Loading admin overview…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="text-xl font-bold text-charcoal-900">Admin overview</h1>
      <p className="mt-1 text-sm text-charcoal-500">High-level platform health and counts.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Cpu className="h-5 w-5" aria-hidden />}
          label="Devices"
          value={overview?.devices.total ?? 0}
          hint={`${overview?.devices.online ?? 0} online · ${overview?.devices.offline ?? 0} offline`}
          tone="live"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" aria-hidden />}
          label="Readings (24h)"
          value={overview?.readings.last24h ?? 0}
          hint={`${overview?.readings.total ?? 0} total`}
        />
        <StatCard
          icon={<Cog className="h-5 w-5" aria-hidden />}
          label="Pending commands"
          value={overview?.commands.pending ?? 0}
          hint={`${overview?.commands.total ?? 0} total commands`}
          tone={overview && overview.commands.pending > 0 ? "warning" : "neutral"}
        />
        <StatCard
          icon={<Mail className="h-5 w-5" aria-hidden />}
          label="Contact messages"
          value={overview?.contactMessages ?? 0}
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Service health"
          action={
            health ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                {health.status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-leaf-600" aria-hidden />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
                )}
                {health.status}
              </span>
            ) : null
          }
        />
        <CardBody>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-charcoal-500">Service</dt>
              <dd className="text-sm font-medium text-charcoal-900">{health?.service ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-charcoal-500">Time</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {health?.time ? new Date(health.time).toLocaleString() : "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-charcoal-400">
            All admin actions are enforced by backend authorization, not just by hiding UI.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
