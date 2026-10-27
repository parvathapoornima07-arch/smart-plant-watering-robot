import { Link } from "react-router-dom";
import { Sprout, Github, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-leaf-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-charcoal-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-600 text-white">
              <Sprout className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm">Smart Plant Watering Robot</span>
          </div>
          <p className="mt-3 text-sm text-charcoal-500">
            An IoT soil moisture monitoring platform for more efficient, data-informed plant watering.
          </p>
        </div>

        <nav aria-label="Public pages">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/how-it-works" className="text-charcoal-600 hover:text-leaf-700">How It Works</Link></li>
            <li><Link to="/hardware" className="text-charcoal-600 hover:text-leaf-700">Hardware</Link></li>
            <li><Link to="/docs" className="text-charcoal-600 hover:text-leaf-700">Documentation</Link></li>
            <li><Link to="/dashboard" className="text-charcoal-600 hover:text-leaf-700">Dashboard</Link></li>
          </ul>
        </nav>

        <nav aria-label="Account">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">Account</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/login" className="text-charcoal-600 hover:text-leaf-700">Sign in</Link></li>
            <li><Link to="/register" className="text-charcoal-600 hover:text-leaf-700">Register</Link></li>
            <li><Link to="/contact" className="text-charcoal-600 hover:text-leaf-700">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">Connect</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="mailto:hello@smartplantwatering.example" className="inline-flex items-center gap-2 text-charcoal-600 hover:text-leaf-700">
                <Mail className="h-4 w-4" aria-hidden /> hello@smartplantwatering.example
              </a>
            </li>
            <li>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-charcoal-600 hover:text-leaf-700">
                <Github className="h-4 w-4" aria-hidden /> Source repository
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-leaf-100 px-4 py-4 text-center text-xs text-charcoal-400">
        © {year} Smart Plant Watering Robot. Built for educational and research use.
      </div>
    </footer>
  );
}
