import { Link } from "react-router-dom";
import { CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/Button";

interface Step {
  n: number;
  title: string;
  description: string;
  status: "done" | "future";
}

const steps: Step[] = [
  {
    n: 1,
    title: "The sensor measures an analog value",
    description:
      "A soil moisture sensor outputs an analog voltage that varies with soil wetness. The ESP32 reads this on GPIO 36.",
    status: "done",
  },
  {
    n: 2,
    title: "The ESP32 reads the sensor through GPIO 36",
    description:
      "The DevKit's 12-bit ADC reports a value nominally in the range 0–4095. The current test sketch reads and prints this to Serial Monitor.",
    status: "done",
  },
  {
    n: 3,
    title: "Multiple readings are averaged",
    description:
      "To reduce fluctuations, 20 readings are taken with a 300 ms delay between each, then averaged.",
    status: "done",
  },
  {
    n: 4,
    title: "Dry and wet references calibrate the sensor",
    description:
      "Dry-sand and wet-sand readings define the 0% and 100% anchors. The percentage is then mapped from these references.",
    status: "done",
  },
  {
    n: 5,
    title: "A watering decision can be made",
    description:
      "Once firmware supports it, a configured threshold decides when watering is needed. This stage is future work.",
    status: "future",
  },
  {
    n: 6,
    title: "The pump can be activated",
    description:
      "When watering conditions are satisfied, the controller can drive the DC pump. Requires firmware control logic.",
    status: "future",
  },
  {
    n: 7,
    title: "Readings and status sent to the backend",
    description:
      "Sensor readings and system events can be sent to the backend once hardware connectivity is implemented.",
    status: "future",
  },
  {
    n: 8,
    title: "The website displays readings and events",
    description:
      "The dashboard shows readings, calibration, and device status with clear live/demo/offline labels.",
    status: "done",
  },
];

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <SectionHeading
        eyebrow="How it works"
        title="Soil moisture to watering, explained"
        description="A beginner-friendly walkthrough of the intended process. Steps clearly marked as done or future work."
      />

      <ol className="mt-12 space-y-4">
        {steps.map((s) => (
          <li key={s.n}>
            <Card>
              <CardBody className="flex items-start gap-4">
                <span
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold " +
                    (s.status === "done"
                      ? "bg-leaf-100 text-leaf-700"
                      : "bg-amber-100 text-amber-700")
                  }
                >
                  {s.n}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-charcoal-900">{s.title}</h3>
                    {s.status === "done" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-leaf-700">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Implemented
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> Future work
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-charcoal-600">{s.description}</p>
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-800">About the serial bridge</p>
            <p className="mt-1 text-sm text-amber-800/90">
              The existing serial bridge only forwards bytes between the computer's
              USB serial and the ESP32-CAM. It does not capture or upload images,
              and it does not send JSON to a server. Those require additional
              firmware and an image ingestion pipeline.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/hardware">
          <Button variant="secondary">View hardware <ArrowRight className="h-4 w-4" aria-hidden /></Button>
        </Link>
        <Link to="/docs">
          <Button>Read the documentation</Button>
        </Link>
      </div>
    </div>
  );
}
