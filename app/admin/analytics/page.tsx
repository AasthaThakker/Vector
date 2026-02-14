"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COLORS = [
  "hsl(220, 90%, 56%)",
  "hsl(165, 70%, 46%)",
  "hsl(40, 90%, 56%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 60%, 56%)",
];

export default function AdminAnalytics() {
  const { data: returnsData } = useSWR("/api/returns?all=true", fetcher);

  const returns = returnsData?.returns || [];

  // Reason breakdown
  const reasonCounts: Record<string, number> = {};
  returns.forEach((r: { reason: string }) => {
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  });
  const reasonData = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason: reason.length > 20 ? reason.slice(0, 20) + "..." : reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Method breakdown
  const methodCounts: Record<string, number> = {};
  returns.forEach((r: { returnMethod: string }) => {
    methodCounts[r.returnMethod] = (methodCounts[r.returnMethod] || 0) + 1;
  });
  const methodData = Object.entries(methodCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  returns.forEach((r: { status: string }) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }));

  // Returns over time (last 7 days)
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const timeData = last7Days.map((date) => {
    const count = returns.filter((r: { createdAt: string }) => {
      return r.createdAt && r.createdAt.startsWith(date);
    }).length;
    return { date: date.slice(5), returns: count };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Insights into return patterns and trends.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Return Reasons</h2>
          {reasonData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reasonData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="reason"
                  width={130}
                  tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 20%, 97%)",
                    border: "1px solid hsl(220, 14%, 89%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(220, 90%, 56%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Return Methods</h2>
          {methodData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available yet.</p>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {methodData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Returns Over Time</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 89%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 20%, 97%)",
                  border: "1px solid hsl(220, 14%, 89%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke="hsl(165, 70%, 46%)"
                strokeWidth={2}
                dot={{ fill: "hsl(165, 70%, 46%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Status Distribution</h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {statusData.map((s, i) => {
                const pct = returns.length > 0 ? (s.value / returns.length) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-foreground">{s.name}</span>
                      <span className="text-muted-foreground">
                        {s.value} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
