import {
  Microchip,
  Camera,
  Droplets,
  CircuitBoard,
  Bot,
  Wrench,
  Gauge,
  BatteryFull,
  type LucideIcon,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeading } from "@/components/common/SectionHeading";

interface Component {
  icon: LucideIcon;
  name: string;
  role: string;
  detail: string;
}

const components: Component[] = [
  {
    icon: Microchip,
    name: "ESP32 DevKit V1 / ESP-WROOM-32",
    role: "Main controller",
    detail:
      "Reads the soil moisture sensor on GPIO 36, runs the averaging and calibration logic, and is the intended platform for cloud connectivity.",
  },
  {
    icon: Camera,
    name: "ESP32-CAM",
    role: "Camera module",
    detail:
      "Handles camera communication. The intended mode is periodic photo capture; capture, transfer, and upload must be implemented separately from the serial bridge.",
  },
  {
    icon: Droplets,
    name: "Soil moisture sensor",
    role: "Sensing",
    detail:
      "Outputs an analog value representing soil moisture. Read via the ESP32's 12-bit ADC (nominally 0–4095).",
  },
  {
    icon: CircuitBoard,
    name: "Motor driver board",
    role: "Motor control",
    detail:
      "Drives the four motors. Controlled by the ESP32 through its GPIO outputs.",
  },
  {
    icon: Bot,
    name: "Four 100 RPM motors and wheels",
    role: "Locomotion",
    detail:
      "Provide movement for the robot base.",
  },
  {
    icon: Wrench,
    name: "DC water pump, water pipe, water container",
    role: "Watering actuator",
    detail:
      "The pump moves water through the pipe from the container when watering is triggered. Independent firmware-side safety limits are required.",
  },
  {
    icon: Gauge,
    name: "SG90 servo motor",
    role: "Mechanical control",
    detail:
      "A small servo for mechanical actuation such as positioning.",
  },
  {
    icon: BatteryFull,
    name: "Four-cell battery holder",
    role: "Power",
    detail:
      "Holds the cells that power the robot. Battery level is only reported if a suitable measurement circuit is added.",
  },
];

export function HardwarePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="Hardware"
        title="Robot components"
        description="The parts used in the Smart Plant Watering Robot. Card images are placeholders — replace with prototype photographs when available."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {components.map((c) => (
          <Card key={c.name} className="overflow-hidden transition hover:shadow-cardHover">
            {/* Placeholder product image */}
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-leaf-50 to-leaf-100 text-leaf-500">
              <c.icon className="h-10 w-10" aria-hidden />
            </div>
            <CardBody>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-leaf-600">
                {c.role}
              </span>
              <h3 className="mt-1 text-sm font-semibold text-charcoal-900">{c.name}</h3>
              <p className="mt-2 text-xs text-charcoal-600">{c.detail}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-charcoal-400">
        Specifications are limited to those supplied for this project. No additional hardware specs are invented here.
      </p>
    </div>
  );
}
