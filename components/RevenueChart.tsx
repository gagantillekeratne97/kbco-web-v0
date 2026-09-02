"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RevenueTrendPoint } from "@/lib/types";

export default function RevenueChart({ data }: { data: RevenueTrendPoint[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-navy-text">Revenue trend</h2>
          <p className="text-xs text-muted mt-0.5">Last {data.length} months</p>
        </div>
        <select className="text-xs border border-border rounded-lg px-2 py-1.5 bg-surface text-ink focus:outline-none">
          <option>Monthly</option>
          <option>Weekly</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5820A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#F5820A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E9F2" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8A93A6", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8A93A6", fontSize: 12 }}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #E6E9F2", fontSize: 12 }}
            formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#0B1E3D" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}