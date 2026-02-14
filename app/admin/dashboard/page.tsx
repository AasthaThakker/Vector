"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Package, RotateCcw, AlertTriangle, CheckCircle, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboard() {
  const { data: returnsData } = useSWR("/api/returns?all=true", fetcher);
  const { data: ordersData } = useSWR("/api/orders?all=true", fetcher);

  const returns = returnsData?.returns || [];
  const orders = ordersData?.orders || [];

  const pendingReturns = returns.filter((r: { status: string }) => r.status === "pending");
  const approvedReturns = returns.filter((r: { status: string }) => r.status === "approved");
  const completedReturns = returns.filter((r: { status: string }) => r.status === "completed");
  const totalRefund = completedReturns.reduce(
    (sum: number, r: { refundAmount?: number }) => sum + (r.refundAmount || 0),
    0
  );

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: <Package className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Total Returns",
      value: returns.length,
      icon: <RotateCcw className="h-5 w-5" />,
      color: "text-amber-500",
    },
    {
      label: "Pending Review",
      value: pendingReturns.length,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-orange-500",
    },
    {
      label: "Completed",
      value: completedReturns.length,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-500",
    },
    {
      label: "Total Refunds",
      value: `$${totalRefund.toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-cyan-500",
    },
    {
      label: "Approved",
      value: approvedReturns.length,
      icon: <Clock className="h-5 w-5" />,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all returns and exchange activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <GlassCard key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={stat.color}>{stat.icon}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pending Returns</h2>
            <Link href="/admin/returns">
              <Button variant="ghost" size="sm">
                Manage All
              </Button>
            </Link>
          </div>
          {pendingReturns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending returns to review.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingReturns.slice(0, 5).map(
                (ret: {
                  _id: string;
                  reason: string;
                  status: string;
                  returnMethod: string;
                  createdAt: string;
                  customerId?: { name?: string };
                }) => (
                  <div
                    key={ret._id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {ret.returnMethod} &middot;{" "}
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={ret.status} />
                  </div>
                )
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Return Method Breakdown</h2>
          {returns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data to display yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {["pickup", "dropbox", "courier"].map((method) => {
                const count = returns.filter(
                  (r: { returnMethod: string }) => r.returnMethod === method
                ).length;
                const pct = returns.length > 0 ? (count / returns.length) * 100 : 0;
                return (
                  <div key={method}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-foreground">{method}</span>
                      <span className="text-muted-foreground">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
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
