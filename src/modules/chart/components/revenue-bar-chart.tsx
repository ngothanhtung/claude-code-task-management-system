"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Revenue, MONTH_NAMES } from "@/types/revenue";

interface RevenueBarChartProps {
  revenues: Revenue[];
}

const BAR_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 80%, 60%)",
  "hsl(187, 75%, 45%)",
  "hsl(142, 70%, 45%)",
  "hsl(30, 95%, 55%)",
  "hsl(348, 83%, 60%)",
  "hsl(204, 86%, 53%)",
  "hsl(280, 70%, 55%)",
  "hsl(160, 70%, 42%)",
  "hsl(45, 93%, 47%)",
  "hsl(14, 90%, 55%)",
  "hsl(330, 80%, 58%)",
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} triệu`;
  }
  return `${value.toLocaleString("vi-VN")} đ`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const month = typeof label === "number" ? label : Number(label);
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
        <p className="mb-1 text-sm font-semibold text-foreground">
          {MONTH_NAMES[month] ?? `Tháng ${label}`}
        </p>
        <p className="text-lg font-bold text-primary">
          {payload[0].value.toLocaleString("vi-VN")} <span className="text-sm font-normal text-muted-foreground">VNĐ</span>
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueBarChart({ revenues }: RevenueBarChartProps) {
  const chartData = revenues.map((r) => ({
    month: r.month,
    label: MONTH_NAMES[r.month] ?? `Tháng ${r.month}`,
    revenue: r.revenue,
  }));

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={chartData}
        margin={{ top: 32, right: 24, left: 16, bottom: 8 }}
        barCategoryGap="28%"
      >
        <defs>
          {BAR_COLORS.map((color, i) => (
            <linearGradient
              key={i}
              id={`barGradient-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.65} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="hsl(var(--border))"
          opacity={0.5}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />

        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: 6 }}
        />

        <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={72}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`url(#barGradient-${index % BAR_COLORS.length})`}
            />
          ))}
          <LabelList
            dataKey="revenue"
            position="top"
            formatter={formatCurrency}
            style={{
              fontSize: "12px",
              fill: "hsl(var(--muted-foreground))",
              fontWeight: 600,
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
