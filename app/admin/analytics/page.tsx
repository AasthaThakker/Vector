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
  const { data: ordersData } = useSWR("/api/orders", fetcher);
  const { data: usersData } = useSWR("/api/users", fetcher);

  const returns = returnsData?.returns || [];
  const orders = ordersData?.orders || [];
  const usersTrustData = usersData || {};

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

      {/* Enhanced Analytics Visualizations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Total Returns</h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{returns.length}</p>
            <p className="text-sm text-muted-foreground">All time returns</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Total Orders</h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{orders.length}</p>
            <p className="text-sm text-muted-foreground">All time orders</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Return Rate</h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">
              {orders.length > 0 ? ((returns.length / orders.length) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Returns per order</p>
          </div>
        </GlassCard>
      </div>

      {/* Workflow Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Return Workflow Status</h2>
          <div className="space-y-3">
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
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">User Trust Score Distribution</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Trust Score</span>
              <span className="font-bold text-purple-600">
                {usersTrustData.averageTrustScore || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">High Trust (71-100)</span>
              <span className="font-bold text-green-600">
                {usersTrustData.trustScoreDistribution?.high || 0} users ({usersTrustData.totalUsers > 0 ? ((usersTrustData.trustScoreDistribution?.high || 0) / usersTrustData.totalUsers * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Medium Trust (40-70)</span>
              <span className="font-bold text-amber-600">
                {usersTrustData.trustScoreDistribution?.medium || 0} users ({usersTrustData.totalUsers > 0 ? ((usersTrustData.trustScoreDistribution?.medium || 0) / usersTrustData.totalUsers * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Low Trust (0-39)</span>
              <span className="font-bold text-red-600">
                {usersTrustData.trustScoreDistribution?.low || 0} users ({usersTrustData.totalUsers > 0 ? ((usersTrustData.trustScoreDistribution?.low || 0) / usersTrustData.totalUsers * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-bold text-blue-600">
                {usersTrustData.totalUsers || 0}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Original Charts */}
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
          <h2 className="mb-4 text-lg font-semibold text-foreground">Financial Impact</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Return Value</span>
              <span className="font-bold text-red-600">
                ₹{returns.reduce((acc: number, r: any) => acc + (r.price || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Return Value</span>
              <span className="font-bold text-blue-600">
                ₹{returns.length > 0 ? (returns.reduce((acc: number, r: any) => acc + (r.price || 0), 0) / returns.length).toFixed(0) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">High Risk Returns</span>
              <span className="font-bold text-amber-600">
                {returns.filter((r: any) => r.riskScore > 70).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Low Risk Returns</span>
              <span className="font-bold text-green-600">
                {returns.filter((r: any) => r.riskScore < 40).length}
              </span>
            </div>
          </div>
        </GlassCard>

        </div>

      {/* Risk Analysis Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">User Behavior Analytics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unique Users with Returns</span>
              <span className="font-bold text-purple-600">
                {new Set(returns.map((r: any) => r.userId)).size}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Returns per User</span>
              <span className="font-bold text-indigo-600">
                {new Set(returns.map((r: any) => r.userId)).size > 0 
                  ? (returns.length / new Set(returns.map((r: any) => r.userId)).size).toFixed(1) 
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Dropbox Usage</span>
              <span className="font-bold text-cyan-600">
                {returns.filter((r: any) => r.returnMethod === 'dropbox').length} ({returns.length > 0 ? ((returns.filter((r: any) => r.returnMethod === 'dropbox').length / returns.length) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pickup Usage</span>
              <span className="font-bold text-teal-600">
                {returns.filter((r: any) => r.returnMethod === 'pickup').length} ({returns.length > 0 ? ((returns.filter((r: any) => r.returnMethod === 'pickup').length / returns.length) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Risk Score Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[
              { range: 'Low (0-40)', count: returns.filter((r: any) => r.riskScore < 40).length },
              { range: 'Medium (40-70)', count: returns.filter((r: any) => r.riskScore >= 40 && r.riskScore <= 70).length },
              { range: 'High (70-100)', count: returns.filter((r: any) => r.riskScore > 70).length }
            ]} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="range"
                width={120}
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
              <Bar dataKey="count" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Monthly Trend Analysis</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={(() => {
              const monthlyData: Record<string, number> = {};
              returns.forEach((r: any) => {
                if (r.createdAt) {
                  const month = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  monthlyData[month] = (monthlyData[month] || 0) + 1;
                }
              });
              return Object.entries(monthlyData).slice(-6).map(([month, count]) => ({ month, count }));
            })()}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 89%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
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
                dataKey="count"
                stroke="hsl(270, 60%, 56%)"
                strokeWidth={2}
                dot={{ fill: "hsl(270, 60%, 56%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
