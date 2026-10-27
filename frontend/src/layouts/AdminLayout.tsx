import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Mail,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/devices", label: "Devices", icon: Cpu },
  { to: "/admin/events", label: "Events", icon: Activity },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-charcoal-50/60">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-charcoal-200 bg-charcoal-900 p-4 md:block">
          <div className="flex items-center gap-2 px-2 pb-4 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-600">
              <ShieldAlert className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold">Admin Console</span>
          </div>
          <nav className="space-y-1" aria-label="Admin">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-charcoal-800 text-white"
                      : "text-charcoal-300 hover:bg-charcoal-800/60 hover:text-white"
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <Button variant="ghost" size="sm" className="w-full justify-start text-charcoal-300 hover:text-white" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to dashboard
            </Button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-charcoal-200 bg-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="md:hidden flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-charcoal-700" aria-hidden />
                <span className="text-sm font-semibold text-charcoal-900">Admin</span>
              </div>
              <p className="hidden text-sm text-charcoal-500 md:block">
                Restricted administrative area — enforced by backend authorization.
              </p>
              <Button variant="secondary" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
                Sign out
              </Button>
            </div>
          </header>
          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-b border-charcoal-100 bg-white px-4 py-2 md:hidden" aria-label="Admin mobile">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                    isActive ? "bg-leaf-50 text-leaf-700" : "text-charcoal-600 hover:bg-leaf-50"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
