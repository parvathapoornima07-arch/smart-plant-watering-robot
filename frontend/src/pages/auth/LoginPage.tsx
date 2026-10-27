import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Signed in.");
      const dest = location.state?.from || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-leaf-50/60 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-600 text-white">
            <Sprout className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-charcoal-900">Welcome back</h1>
          <p className="mt-1 text-sm text-charcoal-500">Sign in to your account</p>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" loading={loading} className="w-full">
                Sign in
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-between text-xs text-charcoal-500">
              <Link to="/forgot-password" className="hover:text-leaf-700">Forgot password?</Link>
              <Link to="/register" className="hover:text-leaf-700">Create account</Link>
            </div>
          </CardBody>
        </Card>
        <p className="mt-4 text-center text-xs text-charcoal-400">
          Authentication is powered by Supabase Auth.
        </p>
      </div>
    </div>
  );
}
