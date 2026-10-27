import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, tone, message }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (m: string) => notify(m, "success"),
      error: (m: string) => notify(m, "error"),
      info: (m: string) => notify(m, "info"),
    }),
    [notify]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-3 shadow-card animate-fade-in",
              t.tone === "success" && "border-leaf-200",
              t.tone === "error" && "border-red-200",
              t.tone === "info" && "border-charcoal-200"
            )}
            role="alert"
          >
            {t.tone === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 text-leaf-600" aria-hidden />}
            {t.tone === "error" && <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden />}
            {t.tone === "info" && <Info className="mt-0.5 h-5 w-5 text-charcoal-600" aria-hidden />}
            <p className="flex-1 text-sm text-charcoal-800">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-charcoal-400 transition hover:text-charcoal-700"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
