import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { supabase } from "@/lib/supabase";

export function ProfilePage() {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const toast = useToast();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? "");
  }, [profile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error("Authentication is not configured.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
      if (error) throw new Error(error.message);
      // Persist display name via backend profile endpoint so it lands in the
      // profiles table (authorised by the verified access token).
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName }),
      });
      await refreshProfile();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal-900">Your profile</h1>
      <p className="mt-1 text-sm text-charcoal-500">Manage your account details.</p>

      <Card className="mt-6">
        <CardHeader title="Account" action={isAdmin ? <Badge tone="success"><ShieldCheck className="h-3 w-3" aria-hidden /> Admin</Badge> : <Badge>Member</Badge>} />
        <CardBody className="space-y-3">
          <div>
            <p className="text-xs text-charcoal-500">Email</p>
            <p className="text-sm font-medium text-charcoal-900">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500">Role</p>
            <p className="text-sm font-medium text-charcoal-900">{profile?.role ?? "user"}</p>
            <p className="mt-1 text-xs text-charcoal-400">
              Roles are assigned by an administrator. You cannot change your own role.
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500">Member since</p>
            <p className="text-sm font-medium text-charcoal-900">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Display name" />
        <CardBody>
          <form onSubmit={onSave} className="space-y-4">
            <Input
              label="Display name"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Save changes</Button>
              <Link to="/dashboard"><Button variant="secondary" type="button">Back to dashboard</Button></Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
