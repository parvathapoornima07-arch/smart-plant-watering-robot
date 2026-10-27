/** Server-side time helpers. Server timestamps are authoritative for receipt time. */

export function nowIso(): string {
  return new Date().toISOString();
}

/** True if `lastSeen` is within the online threshold. */
export function isOnline(
  lastSeen: string | null,
  thresholdMinutes: number
): boolean {
  if (!lastSeen) return false;
  const ts = new Date(lastSeen).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= thresholdMinutes * 60_000;
}
