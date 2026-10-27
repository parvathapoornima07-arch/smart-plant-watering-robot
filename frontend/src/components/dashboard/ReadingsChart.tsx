import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { SensorReading, SensorCalibration } from "@/types";
import { computeMoisturePercentage } from "@/lib/moisture";

interface ReadingsChartProps {
  readings: SensorReading[];
  calibration?: SensorCalibration | null;
  /** Show the calibrated percentage series in addition to raw ADC. */
  showPercentage?: boolean;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Historical readings chart. Raw ADC is always shown; the calibrated
 * percentage series is shown only when calibration is valid (i.e. it is
 * a calibrated estimate, not a direct reading).
 */
export function ReadingsChart({ readings, calibration, showPercentage = true }: ReadingsChartProps) {
  const data = readings.map((r) => {
    const moistureResult = calibration ? computeMoisturePercentage(r.rawMoistureValue, calibration) : null;
    return {
      time: fmtTime(r.deviceTimestamp ?? r.receivedAt),
      raw: r.rawMoistureValue,
      moisture: moistureResult && moistureResult.valid ? moistureResult.percentage : null,
    };
  });

  const hasPercentage = showPercentage && calibration && data.some((d) => d.moisture !== null);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#788080" }} tickLine={false} axisLine={{ stroke: "#cdd2d2" }} />
          <YAxis
            yAxisId="raw"
            domain={[0, 4095]}
            tick={{ fontSize: 11, fill: "#788080" }}
            tickLine={false}
            axisLine={{ stroke: "#cdd2d2" }}
            label={{ value: "ADC", angle: -90, position: "insideLeft", offset: 16, style: { fontSize: 11, fill: "#788080" } }}
          />
          {hasPercentage ? (
            <YAxis
              yAxisId="pct"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#788080" }}
              tickLine={false}
              axisLine={{ stroke: "#cdd2d2" }}
              label={{ value: "%", angle: 90, position: "insideRight", offset: 8, style: { fontSize: 11, fill: "#788080" } }}
            />
          ) : null}
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #dff3e3", fontSize: 12 }}
            labelStyle={{ color: "#3a4040" }}
          />
          {calibration ? (
            <ReferenceLine yAxisId="raw" y={calibration.dryReference} stroke="#c9772e" strokeDasharray="4 4" label={{ value: "dry", fontSize: 10, fill: "#c9772e" }} />
          ) : null}
          {calibration ? (
            <ReferenceLine yAxisId="raw" y={calibration.wetReference} stroke="#237d40" strokeDasharray="4 4" label={{ value: "wet", fontSize: 10, fill: "#237d40" }} />
          ) : null}
          <Line yAxisId="raw" type="monotone" dataKey="raw" stroke="#339c55" strokeWidth={2} dot={false} name="Raw ADC" />
          {hasPercentage ? (
            <Line yAxisId="pct" type="monotone" dataKey="moisture" stroke="#b07d1c" strokeWidth={2} dot={false} name="Moisture %" />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
