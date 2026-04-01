"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface GroupBreakdownChartProps {
  data: { name: string; amountCents: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">
        ${(payload[0].value / 100).toFixed(2)}
      </p>
    </div>
  );
}

export default function GroupBreakdownChart({ data }: GroupBreakdownChartProps) {
  const max = Math.max(...data.map((d) => d.amountCents), 1);
  const truncated = data.slice(0, 6);

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, truncated.length * 44)}>
      <BarChart
        data={truncated}
        layout="vertical"
        barSize={20}
        margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#71717a", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="amountCents" radius={[0, 6, 6, 0]}>
          {truncated.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.amountCents === max ? "#facc15" : "#27272a"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
