import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Device, ConnectionMode } from "@/types";
import { listDevices, getDevice } from "@/services/devices.service";
import { supabase } from "@/lib/supabase";

interface DashboardContextValue {
  devices: Device[];
  activeDevice: Device | null;
  activeDeviceId: string | null;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  enableDemo: () => void;
  exitDemo: () => void;
  setActiveDeviceId: (id: string) => void;
  refreshDevices: () => Promise<void>;
  /** Connection mode derived from active device state + demo toggle. */
  connectionMode: ConnectionMode;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

const STORAGE_KEY = "spwr.activeDeviceId";

/** A device is "online" if it reported a heartbeat within the threshold. */
function deriveConnectionMode(device: Device | null, demoMode: boolean): ConnectionMode {
  if (demoMode) return "demo";
  if (!device) return "offline";
  if (device.status === "online") return "live";
  if (device.status === "offline") return "offline";
  return "offline";
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDeviceId, setActiveDeviceIdState] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const refreshDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listDevices();
      setDevices(list);
      // Pick active device: stored id, else first device, else null.
      const stored = localStorage.getItem(STORAGE_KEY);
      const preferred = stored && list.some((d) => d.deviceId === stored) ? stored : list[0]?.deviceId ?? null;
      setActiveDeviceIdState(preferred);
    } catch (err) {
      // Likely unauthenticated or API not reachable.
      const message = err instanceof Error ? err.message : "Could not load devices.";
      setError(message);
      setDevices([]);
      // If there are no devices and the API isn't reachable, offer demo mode.
      if (!supabase) setError("Backend is not configured.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  // Load the active device detail whenever the id changes (non-demo).
  useEffect(() => {
    if (demoMode || !activeDeviceId) {
      setActiveDevice(null);
      return;
    }
    let cancelled = false;
    getDevice(activeDeviceId)
      .then((d) => {
        if (!cancelled) setActiveDevice(d);
      })
      .catch(() => {
        if (!cancelled) setActiveDevice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeDeviceId, demoMode]);

  const setActiveDeviceId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveDeviceIdState(id);
    setDemoMode(false);
  }, []);

  const enableDemo = useCallback(() => setDemoMode(true), []);
  const exitDemo = useCallback(() => setDemoMode(false), []);

  const connectionMode = deriveConnectionMode(activeDevice, demoMode);

  const value = useMemo<DashboardContextValue>(
    () => ({
      devices,
      activeDevice,
      activeDeviceId,
      loading,
      error,
      demoMode,
      enableDemo,
      exitDemo,
      setActiveDeviceId,
      refreshDevices,
      connectionMode,
    }),
    [devices, activeDevice, activeDeviceId, loading, error, demoMode, enableDemo, exitDemo, setActiveDeviceId, refreshDevices, connectionMode]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (ctx === undefined) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}
