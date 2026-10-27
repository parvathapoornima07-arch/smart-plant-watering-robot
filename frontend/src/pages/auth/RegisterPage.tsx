import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (displayName.trim().length < 2) next.displayName = "Enter your name.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      toast.success("Account created. Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      if (message === "CONFIRM_EMAIL") {
        toast.info("Check your email to confirm your account, then sign in.");
        navigate("/login", { replace: true });
      } else {
        toast.error(message);
      }
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
          <h1 className="mt-4 text-2xl font-bold text-charcoal-900">Create an account</h1>
          <p className="mt-1 text-sm text-charcoal-500">Start monitoring your robot</p>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <Input
                label="Display name"
                name="displayName"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={errors.displayName}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                hint="At least 8 characters."
              />
              <Input
                label="Confirm password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={errors.confirm}
              />
              <Button type="submit" loading={loading} className="w-full">
                Create account
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-charcoal-500">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-leaf-700 hover:underline">Sign in</Link>
            </p>
          </CardBody>
        </Card>
        <p className="mt-4 text-center text-xs text-charcoal-400">
          New accounts are created as users, not admins. Admin roles are assigned server-side only.
        </p>
      </div>
    </div>
  );
}
