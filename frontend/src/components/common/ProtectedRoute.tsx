import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/Spinner";

/**
 * Guards routes that require an authenticated session.
 * Redirects to /login and remembers where to return after sign-in.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

/**
 * Guards admin routes. Requires both an authenticated session AND a
 * server-assigned admin role. The backend enforces authorization on every
 * admin API call regardless of this guard.
 */
export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
