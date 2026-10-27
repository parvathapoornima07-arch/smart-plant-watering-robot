import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { submitContact, type ContactPayload } from "@/services/contact.service";

interface FormState extends ContactPayload {}
type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormState): Errors {
  const e: Errors = {};
  if (!values.name.trim()) e.name = "Name is required.";
  else if (values.name.trim().length < 2) e.name = "Name is too short.";
  if (!values.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(values.email.trim())) e.email = "Enter a valid email.";
  if (!values.subject.trim()) e.subject = "Subject is required.";
  else if (values.subject.trim().length < 3) e.subject = "Subject is too short.";
  if (!values.message.trim()) e.message = "Message is required.";
  else if (values.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
  return e;
}

const initial: FormState = { name: "", email: "", subject: "", message: "" };

export function ContactPage() {
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const setField = (key: keyof FormState, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      await submitContact(values);
      setSubmitted(true);
      setValues(initial);
      toast.success("Message sent. We'll get back to you.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send message.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-leaf-600">Contact</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal-900">Get in touch</h1>
        <p className="mt-3 text-sm text-charcoal-600">
          Questions, feedback, or ideas? Send a message and we'll respond as soon as we can.
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader title="Send a message" />
        <CardBody>
          {submitted ? (
            <div
              className="rounded-xl border border-leaf-200 bg-leaf-50 p-5 text-sm text-leaf-800"
              role="status"
            >
              Thanks — your message was received. You can send another below.
            </div>
          ) : null}
          <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
            <Input
              label="Name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              error={errors.email}
            />
            <Input
              label="Subject"
              name="subject"
              value={values.subject}
              onChange={(e) => setField("subject", e.target.value)}
              error={errors.subject}
            />
            <Textarea
              label="Message"
              name="message"
              value={values.message}
              onChange={(e) => setField("message", e.target.value)}
              error={errors.message}
            />
            <Button type="submit" loading={submitting} className="w-full sm:w-auto">
              <Send className="h-4 w-4" aria-hidden /> Send message
            </Button>
          </form>
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-xs text-charcoal-400">
        Submissions are validated on both the client and server, rate-limited, and stored in Supabase.
      </p>
    </div>
  );
}
