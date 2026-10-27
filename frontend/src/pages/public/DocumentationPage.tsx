import { FileText, Download, FolderArchive, AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SectionHeading } from "@/components/common/SectionHeading";

const sections = [
  {
    title: "Project introduction",
    body: "The Smart Plant Watering Robot is an ESP32-based system that measures soil moisture and is designed to support efficient, data-informed watering. This platform pairs the hardware with a web dashboard for monitoring and control.",
  },
  {
    title: "Problem statement",
    body: "Manual watering is inconsistent and easy to over- or under-do. Without measuring soil moisture, it's hard to know when a plant actually needs water.",
  },
  {
    title: "Objectives",
    body: "Read soil moisture reliably, calibrate the sensor against dry and wet references, and present readings and device status on a responsive dashboard — without fabricating live data.",
  },
  {
    title: "Hardware requirements",
    body: "ESP32 DevKit V1, ESP32-CAM, soil moisture sensor, motor driver, four 100 RPM motors with wheels, DC water pump with pipe and container, SG90 servo, and a four-cell battery holder.",
  },
  {
    title: "Software requirements",
    body: "React + Vite + TypeScript frontend, Node/Express + TypeScript backend, Supabase Postgres + Auth, secure device authentication, and calibrated moisture calculation.",
  },
  {
    title: "System architecture",
    body: "ESP32 firmware → authenticated HTTPS device endpoint → Express backend → Supabase Postgres → dashboard (polling now, realtime later). Device tokens are hashed; the service-role key is server-only.",
  },
  {
    title: "Implementation methodology",
    body: "Build in stages: sensor testing → averaging → reference calibration → serial bridge → cloud connectivity → dashboard. Each stage is testable independently.",
  },
  {
    title: "Soil moisture sensor testing method",
    body: "The ESP32 reads the sensor on GPIO 36 using the 12-bit ADC. The test sketch prints raw values to Serial Monitor so the sensor's behaviour can be observed.",
  },
  {
    title: "Dry and wet reference measurement",
    body: "20 readings with a 300 ms delay are averaged. The user records an average for dry sand and an average for wet sand. These define the 0% and 100% anchors used by the calibration formula.",
  },
  {
    title: "ESP32-to-ESP32-CAM serial bridge",
    body: "A bridge program forwards bytes between the computer's USB serial and the ESP32-CAM. It moves bytes only — it does not capture images or post JSON to a server.",
  },
  {
    title: "Testing and observations",
    body: "Sensor readings fluctuate, which is why averaging is used. Dry and wet references differ noticeably, confirming the sensor responds to moisture. Camera capture and cloud reporting require additional work.",
  },
  {
    title: "Limitations",
    body: "Camera capture/upload is not implemented. Cloud reporting from the ESP32 is not yet implemented. Battery level requires a measurement circuit. The percentage is a calibrated estimate, not a lab soil-water measurement.",
  },
  {
    title: "Future enhancements",
    body: "Periodic camera capture and image history, Supabase Realtime, automatic watering with safe firmware-side limits, device command polling/acknowledgement, and battery monitoring.",
  },
];

export function DocumentationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <SectionHeading
        eyebrow="Documentation"
        title="Project documentation"
        description="A structured overview of the project: problem, objectives, method, and limitations."
      />

      <div className="mt-10 space-y-4">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader title={s.title} />
            <CardBody>
              <p className="text-sm text-charcoal-600">{s.body}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Files area */}
      <Card className="mt-10">
        <CardHeader title="Project files" description="Diagrams, code, and report files will be added here by the administrator." />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-leaf-200 bg-leaf-50/50 p-4">
              <FolderArchive className="h-6 w-6 text-charcoal-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-charcoal-700">Source code</p>
                <p className="text-xs text-charcoal-400">Pending upload</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-leaf-200 bg-leaf-50/50 p-4">
              <FileText className="h-6 w-6 text-charcoal-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-charcoal-700">Project report</p>
                <p className="text-xs text-charcoal-400">Pending upload</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-leaf-200 bg-leaf-50/50 p-4">
              <Download className="h-6 w-6 text-charcoal-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-charcoal-700">Circuit diagrams</p>
                <p className="text-xs text-charcoal-400">Pending upload</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-leaf-200 bg-leaf-50/50 p-4">
              <FileText className="h-6 w-6 text-charcoal-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-charcoal-700">Firmware sketches</p>
                <p className="text-xs text-charcoal-400">Pending upload</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm text-amber-800">
            File uploads are managed by an administrator and are not yet connected. The links above are placeholders.
          </p>
        </div>
      </div>
    </div>
  );
}
