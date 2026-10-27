import { useState } from "react";
import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      toast.info("If that email exists, a reset link is on its way.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
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
          <h1 className="mt-4 text-2xl font-bold text-charcoal-900">Reset password</h1>
          <p className="mt-1 text-sm text-charcoal-500">We'll email you a reset link</p>
        </div>
        <Card>
          <CardBody>
            {sent ? (
              <p className="text-sm text-leaf-800" role="status">
                Check your inbox for a password reset link. The link expires after a short time.
              </p>
            ) : (
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
                <Button type="submit" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>
            )}
            <p className="mt-4 text-center text-xs text-charcoal-500">
              <Link to="/login" className="hover:text-leaf-700">Back to sign in</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
