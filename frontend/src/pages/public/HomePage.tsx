import { Link } from "react-router-dom";
import {
  Droplets,
  Camera,
  Bot,
  Gauge,
  ShieldCheck,
  Activity,
  Wifi,
  ArrowRight,
  CircuitBoard,
  Microchip,
  BatteryFull,
  Wrench,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeading } from "@/components/common/SectionHeading";
import { cn } from "@/lib/cn";

const workflowSteps = [
  { icon: Droplets, label: "Soil Moisture Sensor" },
  { icon: Microchip, label: "ESP32 DevKit" },
  { icon: Gauge, label: "Moisture Processing" },
  { icon: Activity, label: "Watering Decision" },
  { icon: Wrench, label: "Pump Control" },
  { icon: Wifi, label: "Website Monitoring" },
];

const features = [
  {
    icon: Droplets,
    title: "Soil moisture monitoring",
    description:
      "Reads an analog soil moisture sensor through the ESP32's GPIO 36 and shows raw ADC values alongside a calibrated moisture estimate.",
  },
  {
    icon: Gauge,
    title: "Dry/wet calibration",
    description:
      "Record dry and wet reference readings to map raw ADC values to a 0–100% moisture estimate that respects the sensor's polarity.",
  },
  {
    icon: Bot,
    title: "Robot status",
    description:
      "Track device connectivity, last heartbeat, and motor/pump state when the device reports them. No fabricated states.",
  },
  {
    icon: Camera,
    title: "ESP32-CAM capture",
    description:
      "Designed for periodic image capture and history. Shows a clear empty state until camera ingestion is implemented.",
  },
  {
    icon: ShieldCheck,
    title: "Secure device auth",
    description:
      "Per-device tokens are hashed and never embedded in firmware or exposed to the browser. Revocation and rotation supported.",
  },
  {
    icon: Activity,
    title: "Live + demo modes",
    description:
      "A clearly labeled demo mode previews the dashboard before hardware integration, and never masquerades as live data.",
  },
];

const hardwareSummary = [
  { icon: Microchip, name: "ESP32 DevKit V1", note: "Main controller (GPIO 36 ADC)" },
  { icon: Camera, name: "ESP32-CAM", note: "Camera communication" },
  { icon: Droplets, name: "Soil moisture sensor", note: "Analog readings" },
  { icon: CircuitBoard, name: "Motor driver board", note: "Drives the motors" },
  { icon: Bot, name: "4× 100 RPM motors + wheels", note: "Locomotion" },
  { icon: Wrench, name: "DC water pump + pipe", note: "Watering actuator" },
  { icon: Gauge, name: "SG90 servo motor", note: "Mechanical control" },
  { icon: BatteryFull, name: "4-cell battery holder", note: "Power" },
];

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-leaf-100/70 via-leaf-50 to-white" aria-hidden />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-px opacity-0"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" aria-hidden />
              IoT · Smart agriculture · ESP32
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-charcoal-900 sm:text-5xl">
              Smart Plant Watering Robot
            </h1>
            <p className="mt-4 text-base text-charcoal-600 sm:text-lg">
              An ESP32-powered robot that measures soil moisture and supports
              more efficient, data-informed plant watering. Monitor readings,
              calibrate your sensor, and keep an eye on device status — all from
              one responsive dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button size="lg">
                  Explore Dashboard <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="secondary" size="lg">How it works</Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-charcoal-400">
              Hardware integration is in progress. The dashboard clearly labels
              live, demo, and offline states.
            </p>
          </div>
        </div>
      </section>

      {/* How it works (summary) */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Workflow"
          title="From soil to screen"
          description="The intended system flow, step by step. Some later stages require firmware work before they are operational."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="relative">
              <Card className="h-full">
                <CardBody className="flex flex-col items-center gap-3 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-leaf-700">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-xs font-semibold text-charcoal-800">{step.label}</p>
                  <span className="text-[10px] font-medium text-charcoal-300">
                    Step {i + 1}
                  </span>
                </CardBody>
              </Card>
              {i < workflowSteps.length - 1 ? (
                <ArrowRight
                  className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-leaf-300 lg:block"
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-charcoal-400">
          This is the intended complete system workflow. Not all stages are operational yet.
        </p>
      </section>

      {/* Key features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Features"
            title="What the platform does"
            description="A focused monitoring and control surface built around the actual ESP32 hardware."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition hover:shadow-cardHover">
                <CardBody>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-charcoal-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-charcoal-600">{f.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware components */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Hardware"
          title="Components at a glance"
          description="The parts that make up the robot. See the hardware page for full descriptions."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hardwareSummary.map((h) => (
            <Card key={h.name}>
              <CardBody className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600">
                  <h.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">{h.name}</p>
                  <p className="mt-0.5 text-xs text-charcoal-500">{h.note}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/hardware">
            <Button variant="secondary">View hardware details <ArrowRight className="h-4 w-4" aria-hidden /></Button>
          </Link>
        </div>
      </section>

      {/* System architecture */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Architecture"
            title="How the system fits together"
            description="A secure, extensible path from device to dashboard, using Supabase for auth and data."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {[
              { icon: Microchip, title: "ESP32 firmware", note: "Reads sensors, controls the pump, reports over HTTPS" },
              { icon: Wifi, title: "Express API", note: "Validates & stores device data on Render" },
              { icon: ShieldCheck, title: "Supabase", note: "Postgres + Auth + Storage + RLS" },
              { icon: Activity, title: "Realtime / polling", note: "Dashboard refreshes on new data" },
              { icon: Gauge, title: "Dashboard", note: "React UI with live/demo/offline states" },
            ].map((node, i) => (
              <div key={node.title} className="relative">
                <Card className="h-full">
                  <CardBody className="flex flex-col items-center gap-3 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
                      <node.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="text-sm font-semibold text-charcoal-900">{node.title}</p>
                    <p className="text-xs text-charcoal-500">{node.note}</p>
                  </CardBody>
                </Card>
                {i < 4 ? (
                  <ArrowRight
                    className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-leaf-300 lg:block"
                    aria-hidden
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project workflow */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Project development"
          title="How the project was built"
          description="A staged approach: sensor testing first, then calibration, then connectivity, then monitoring."
        />
        <ol className="mt-10 space-y-4">
          {[
            { t: "Sensor testing", d: "ESP32 reads the soil moisture sensor on GPIO 36 and prints analog values to Serial Monitor." },
            { t: "Averaging", d: "20 readings taken with a 300 ms delay are averaged to reduce noise." },
            { t: "Reference calibration", d: "Dry-sand and wet-sand readings establish the 0% and 100% anchors." },
            { t: "Serial bridge", d: "A bridge forwards bytes between the computer's USB serial and the ESP32-CAM." },
            { t: "Cloud connectivity", d: "Firmware changes to send authenticated sensor data to the backend (in progress)." },
            { t: "Dashboard", d: "React dashboard with live, demo, and offline states (this project)." },
          ].map((item, i) => (
            <li key={item.t} className="flex gap-4">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", i < 4 ? "bg-leaf-100 text-leaf-700" : "bg-amber-100 text-amber-700")}>
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-charcoal-900">{item.t}</p>
                <p className="text-sm text-charcoal-600">{item.d}</p>
                {i >= 4 ? <p className="mt-1 text-xs text-amber-700">Requires additional firmware / integration work</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Gallery */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Gallery"
            title="Prototype images"
            description="Placeholder slots for actual prototype photographs. Replace these with real images once captured."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-leaf-200 bg-leaf-50/60 text-charcoal-400"
                aria-label={`Prototype image placeholder ${i + 1}`}
              >
                <ImageIcon className="h-8 w-8" aria-hidden />
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-charcoal-400">
            Actual prototype images will be added by the project administrator.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="overflow-hidden">
          <CardBody className="flex flex-col items-center gap-4 bg-gradient-to-br from-leaf-700 to-leaf-800 px-6 py-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to monitor your plants?</h2>
            <p className="max-w-xl text-sm text-leaf-100">
              Sign in to view your device dashboard, calibrate your sensor, and watch readings arrive.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/dashboard">
                <Button variant="secondary" size="lg">Open dashboard</Button>
              </Link>
              <Link to="/register">
                <Button size="lg" className="bg-white text-leaf-700 hover:bg-leaf-50">Create an account</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>
    </>
  );
}
