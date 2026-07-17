"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueData = {
  date: string;
  revenue: number;
};

interface RevenueChartProps {
  data: RevenueData[];
}

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString()}`;
};

export default function RevenueChart({
  data,
}: RevenueChartProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Revenue Overview
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Revenue generated over the last 30 days
        </p>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickFormatter={(value) =>
                `₦${Number(value / 1000).toFixed(0)}k`
              }
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? formatCurrency(value) : value
              }
              labelClassName="text-slate-700"
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}