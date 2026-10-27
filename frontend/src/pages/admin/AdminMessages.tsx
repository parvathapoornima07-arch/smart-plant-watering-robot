import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { getAdminContactMessages } from "@/services/admin.service";
import type { ContactMessage } from "@/types";

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await getAdminContactMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading && messages.length === 0) return <PageLoader label="Loading messages…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="text-xl font-bold text-charcoal-900">Contact messages</h1>
      <p className="mt-1 text-sm text-charcoal-500">Submissions from the public contact form.</p>

      <Card className="mt-6">
        <CardBody>
          {messages.length === 0 ? (
            <EmptyState icon={<Mail className="h-8 w-8" />} title="No messages yet" description="Contact form submissions will appear here." />
          ) : (
            <ul className="divide-y divide-leaf-50">
              {messages.map((m) => (
                <li key={m.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-charcoal-900">{m.subject}</p>
                    <span className="text-xs text-charcoal-400">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    {m.name} · <a href={`mailto:${m.email}`} className="text-leaf-700 hover:underline">{m.email}</a>
                  </p>
                  <p className="mt-2 text-sm text-charcoal-700">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
