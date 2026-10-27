import { Link } from "react-router-dom";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-leaf-50 px-6 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-600 text-white">
        <Sprout className="h-8 w-8" aria-hidden />
      </span>
      <p className="text-5xl font-bold text-charcoal-900">404</p>
      <p className="mt-2 text-lg font-medium text-charcoal-700">Page not found</p>
      <p className="mt-2 max-w-md text-sm text-charcoal-500">
        The page you're looking for may have been moved or doesn't exist.
      </p>
      <Link to="/" className="mt-6">
        <Button>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to home
        </Button>
      </Link>
    </div>
  );
}
