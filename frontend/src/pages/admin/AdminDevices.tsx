import { useEffect, useState } from "react";
import { Cpu, Plus, RefreshCw, Ban, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/contexts/ToastContext";
import {
  getAdminDevices,
} from "@/services/admin.service";
import {
  listDevices,
  registerDevice,
  revokeDevice,
  rotateDeviceToken,
} from "@/services/devices.service";
import type { Device } from "@/types";

export function AdminDevices() {
  const toast = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [revealedToken, setRevealedToken] = useState<{ deviceId: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAdminDevices().catch(() => listDevices());
      setDevices(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) {
      toast.error("Enter both a device ID and a name.");
      return;
    }
    setRegistering(true);
    try {
      const { device, token } = await registerDevice({ deviceId: newId.trim(), name: newName.trim() });
      setRevealedToken({ deviceId: device.deviceId, token });
      setCopied(false);
      toast.success("Device registered. Copy the token now — it is shown only once.");
      setNewId("");
      setNewName("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register device.");
    } finally {
      setRegistering(false);
    }
  };

  const onRevoke = async (deviceId: string) => {
    if (!confirm(`Revoke device ${deviceId}? Its token will stop working immediately.`)) return;
    try {
      await revokeDevice(deviceId);
      toast.success("Device revoked.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke device.");
    }
  };

  const onRotate = async (deviceId: string) => {
    if (!confirm(`Rotate the token for ${deviceId}? The old token will stop working.`)) return;
    try {
      const { token } = await rotateDeviceToken(deviceId);
      setRevealedToken({ deviceId, token });
      setCopied(false);
      toast.success("Token rotated. Copy the new token now — it is shown only once.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rotate token.");
    }
  };

  const copyToken = async () => {
    if (!revealedToken) return;
    try {
      await navigator.clipboard.writeText(revealedToken.token);
      setCopied(true);
      toast.success("Token copied to clipboard.");
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  if (loading && devices.length === 0) return <PageLoader label="Loading devices…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="text-xl font-bold text-charcoal-900">Devices</h1>
      <p className="mt-1 text-sm text-charcoal-500">Register devices, rotate credentials, and revoke access.</p>

      <Card className="mt-6">
        <CardHeader title="Register a new device" />
        <CardBody>
          <form onSubmit={onRegister} className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Device ID"
              name="deviceId"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="e.g. esp32-robot-01"
            />
            <Input
              label="Device name"
              name="deviceName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Greenhouse Unit"
            />
            <div className="flex items-end">
              <Button type="submit" loading={registering} className="w-full sm:w-auto">
                <Plus className="h-4 w-4" aria-hidden /> Register
              </Button>
            </div>
          </form>

          {revealedToken ? (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Token for {revealedToken.deviceId} — shown once
              </p>
              <p className="mt-1 text-xs text-amber-800/80">
                Store this securely in your firmware config. The backend stores only a hash.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="block w-full break-all rounded-lg bg-white px-3 py-2 text-xs text-charcoal-800">
                  {revealedToken.token}
                </code>
                <Button variant="secondary" size="sm" onClick={copyToken} className="shrink-0">
                  {copied ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                  Copy
                </Button>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader title={`Registered devices (${devices.length})`} />
        <CardBody>
          {devices.length === 0 ? (
            <EmptyState icon={<Cpu className="h-8 w-8" />} title="No devices yet" description="Register a device above to issue its credential." />
          ) : (
            <ul className="divide-y divide-leaf-50">
              {devices.map((d) => (
                <li key={d.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-charcoal-900">{d.name}</p>
                      <Badge tone={d.status === "online" ? "success" : "neutral"}>{d.status}</Badge>
                    </div>
                    <p className="text-xs text-charcoal-500">
                      ID: {d.deviceId} · Last seen: {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : "never"}
                      {d.firmwareVersion ? ` · Firmware ${d.firmwareVersion}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onRotate(d.deviceId)}>
                      <RefreshCw className="h-4 w-4" aria-hidden /> Rotate token
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onRevoke(d.deviceId)}>
                      <Ban className="h-4 w-4" aria-hidden /> Revoke
                    </Button>
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
