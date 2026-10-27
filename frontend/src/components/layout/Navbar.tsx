import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sprout, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/hardware", label: "Hardware" },
  { to: "/docs", label: "Documentation" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-leaf-100 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2 font-semibold text-charcoal-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-600 text-white">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm sm:text-base">Smart Plant Watering Robot</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "text-leaf-700 bg-leaf-50"
                    : "text-charcoal-600 hover:text-charcoal-900 hover:bg-leaf-50/60"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-4 w-4" aria-hidden /> Dashboard
              </Button>
              {isAdmin ? (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                  Admin
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-charcoal-700 hover:bg-leaf-50 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-leaf-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    isActive ? "text-leaf-700 bg-leaf-50" : "text-charcoal-700 hover:bg-leaf-50"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-leaf-100 pt-3">
              {user ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                    Dashboard
                  </Button>
                  {isAdmin ? (
                    <Button variant="ghost" size="sm" onClick={() => { setOpen(false); navigate("/admin"); }}>
                      Admin
                    </Button>
                  ) : null}
                </>
              ) : (
                <>
                  <Button variant="secondary" size="sm" onClick={() => { setOpen(false); navigate("/login"); }}>
                    Sign in
                  </Button>
                  <Button size="sm" onClick={() => { setOpen(false); navigate("/register"); }}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
