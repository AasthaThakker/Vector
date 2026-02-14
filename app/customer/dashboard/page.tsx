"use client";

import useSWR from "swr";
import { useAuth } from "@/lib/useAuth";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Package, RotateCcw, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: ordersData } = useSWR("/api/orders", fetcher);
  const { data: returnsData } = useSWR("/api/returns", fetcher);

  const orders = ordersData?.orders || [];
  const returns = returnsData?.returns || [];

  const stats = [
    { label: "Total Orders", value: orders.length, icon: <Package className="h-5 w-5" />, color: "text-primary" },
    { label: "Active Returns", value: returns.filter((r: { status: string }) => !["completed", "rejected"].includes(r.status)).length, icon: <RotateCcw className="h-5 w-5" />, color: "text-amber-500" },
    { label: "Pending", value: returns.filter((r: { status: string }) => r.status === "pending").length, icon: <Clock className="h-5 w-5" />, color: "text-blue-500" },
    { label: "Completed", value: returns.filter((r: { status: string }) => r.status === "completed").length, icon: <CheckCircle className="h-5 w-5" />, color: "text-emerald-500" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here is an overview of your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <Link href="/customer/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet. Seed demo data from the home page.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.slice(0, 3).map((order: { _id: string; products: { name: string; category: string; price: number }[]; status: string; orderDate: string }) => (
                <div key={order._id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {order.products.map((p: { name: string }) => p.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active Returns</h2>
            <Link href="/customer/returns">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          {returns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No return requests yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {returns.slice(0, 3).map((ret: { _id: string; reason: string; status: string; returnMethod: string; createdAt: string }) => (
                <div key={ret._id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {ret.returnMethod} &middot; {new Date(ret.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={ret.status} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
