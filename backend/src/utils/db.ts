import { getAdminClient } from "../config/supabase";

/** Helper around the admin (service-role) Supabase client for table access. */
export function db() {
  return getAdminClient();
}

/** Clamp pagination inputs to sane bounds and compute PostgREST range bounds. */
export function normalizePage(page?: number, pageSize?: number) {
  const p = Number(page) > 0 ? Math.floor(Number(page)) : 1;
  const ps = Number(pageSize) > 0 ? Math.min(100, Math.floor(Number(pageSize))) : 20;
  const rangeFrom = (p - 1) * ps;
  const rangeTo = rangeFrom + ps - 1;
  return { p, ps, rangeFrom, rangeTo };
}

export function paginationMeta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
