import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FOREST = "#2F5233";
const EMERALD = "#34D399";
const EMERALD_DEEP = "#0E7C4E";
const LINE = "rgba(47,82,51,0.18)";

const PALETTE = [EMERALD_DEEP, "#4D7052", EMERALD, "#8AB79A", "#1B3220"];

const axisProps = {
  stroke: LINE,
  tick: { fill: FOREST, fontSize: 12 },
  tickLine: false,
};

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#EDF6F0",
        border: `1px solid ${LINE}`,
        borderRadius: 6,
        padding: "8px 10px",
        fontSize: 13,
        color: FOREST,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", gap: 10 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ marginLeft: "auto" }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Site-themed chart for MDX articles.
 *
 *   <EnergyChart
 *     client:visible
 *     type="line"
 *     data={[{ hour: "00:00", baseline: 210, retrofit: 105 }]}
 *     xKey="hour"
 *     series={[
 *       { key: "baseline", name: "Baseline" },
 *       { key: "retrofit", name: "After retrofit" },
 *     ]}
 *     unit="kW"
 *     yLabel="Demand (kW)"
 *   />
 */
export default function EnergyChart({
  type = "line",
  data = [],
  xKey = "x",
  series = [],
  unit = "",
  yLabel,
  height = 320,
  stacked = false,
}) {
  const Root = type === "bar" ? BarChart : type === "area" ? AreaChart : LineChart;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <Root data={data} margin={{ top: 8, right: 12, bottom: 4, left: yLabel ? 8 : 0 }}>
          <CartesianGrid stroke={LINE} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis
            {...axisProps}
            width={yLabel ? 68 : 44}
            label={
              yLabel
                ? { value: yLabel, angle: -90, position: "insideLeft", fill: FOREST, fontSize: 12 }
                : undefined
            }
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: LINE }} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 13, color: FOREST }} />}

          {series.map((s, i) => {
            const color = s.color ?? PALETTE[i % PALETTE.length];
            if (type === "bar") {
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name ?? s.key}
                  fill={color}
                  stackId={stacked ? "a" : undefined}
                  radius={[3, 3, 0, 0]}
                />
              );
            }
            if (type === "area") {
              return (
                <Area
                  key={s.key}
                  dataKey={s.key}
                  name={s.name ?? s.key}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.22}
                  strokeWidth={2}
                  stackId={stacked ? "a" : undefined}
                />
              );
            }
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.name ?? s.key}
                stroke={color}
                strokeWidth={2.25}
                strokeDasharray={s.dashed ? "6 5" : undefined}
                dot={false}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </Root>
      </ResponsiveContainer>
    </div>
  );
}
