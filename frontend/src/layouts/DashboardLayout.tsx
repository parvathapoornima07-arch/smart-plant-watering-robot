import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Droplets,
  SlidersHorizontal,
  Camera,
  Bot,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Button } from "@/components/ui/Button";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/soil", label: "Soil Moisture", icon: Droplets },
  { to: "/dashboard/calibration", label: "Calibration", icon: SlidersHorizontal },
  { to: "/dashboard/camera", label: "Camera", icon: Camera },
  { to: "/dashboard/robot", label: "Robot Status", icon: Bot },
];

export function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-leaf-50/60">
      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-leaf-100 bg-white p-4 md:block">
          <DashboardSidebar navItems={navItems} user={user} profile={profile} onSignOut={handleSignOut} />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-charcoal-900/30" onClick={() => setMobileOpen(false)} aria-hidden />
            <aside className="absolute left-0 top-0 h-full w-64 border-r border-leaf-100 bg-white p-4">
              <DashboardSidebar
                navItems={navItems}
                user={user}
                profile={profile}
                onSignOut={handleSignOut}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        ) : null}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-leaf-100 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-charcoal-700 hover:bg-leaf-50 md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Open navigation"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link to="/" className="flex items-center gap-2 font-semibold text-charcoal-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-leaf-600 text-white">
                  <Sprout className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm">Smart Plant Watering Robot</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <UserIcon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
    </DashboardProvider>
  );
}

interface SidebarProps {
  navItems: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[];
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  onSignOut: () => void;
  onNavigate?: () => void;
}

function DashboardSidebar({ navItems, user, profile, onSignOut, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-charcoal-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-600 text-white">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm">SPWR</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Dashboard">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-leaf-50 text-leaf-700"
                  : "text-charcoal-600 hover:bg-leaf-50/60 hover:text-charcoal-900"
              )
            }
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-leaf-100 pt-3">
        <div className="rounded-lg bg-leaf-50/60 p-3">
          <p className="truncate text-sm font-medium text-charcoal-800">
            {profile?.displayName || user?.email || "User"}
          </p>
          <p className="text-xs text-charcoal-500">{profile?.role ?? "user"}</p>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={onSignOut}>
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </Button>
      </div>
    </div>
  );
}
