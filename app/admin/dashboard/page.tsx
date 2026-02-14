"use client";

import useSWR from "swr";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  Users,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  Zap
} from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboard() {
  const { data: returnsData } = useSWR("/api/returns?all=true", fetcher);
  const { data: ordersData } = useSWR("/api/orders?all=true", fetcher);

  const returns = returnsData?.returns || [];
  const orders = ordersData?.orders || [];

  const pendingReturns = returns.filter((r: { status: string }) => r.status === "pending");
  const approvedReturns = returns.filter((r: { status: string }) => r.status === "approved");
  const completedReturns = returns.filter((r: { status: string }) => r.status === "completed");
  const rejectedReturns = returns.filter((r: { status: string }) => r.status === "rejected");
  
  const totalRefund = completedReturns.reduce(
    (sum: number, r: { refundAmount?: number }) => sum + (r.refundAmount || 0),
    0
  );

  // Calculate return rate
  const returnRate = orders.length > 0 ? ((returns.length / orders.length) * 100).toFixed(1) : "0.0";

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: <ShoppingBag className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-400/20 to-indigo-400/10",
      badge: "All Time"
    },
    {
      label: "Total Returns",
      value: returns.length,
      icon: <RefreshCw className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      gradient: "from-amber-400/20 to-orange-400/10",
      badge: `${returnRate}% rate`
    },
    {
      label: "Pending Review",
      value: pendingReturns.length,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      gradient: "from-orange-400/20 to-red-400/10",
      badge: pendingReturns.length > 0 ? "Action Needed" : null
    },
    {
      label: "Completed",
      value: completedReturns.length,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      gradient: "from-emerald-400/20 to-green-400/10",
      badge: null
    },
    {
      label: "Total Refunds",
      value: `Rs.${totalRefund.toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      gradient: "from-cyan-400/20 to-teal-400/10",
      badge: null
    },
    {
      label: "Approved",
      value: approvedReturns.length,
      icon: <Clock className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-400/20 to-violet-400/10",
      badge: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 text-sm">
                Overview of all returns, orders, and system activity
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Apple/Amazon Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full -translate-y-1/2 translate-x-1/2`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  {stat.badge && (
                    <span className={`text-xs font-medium ${stat.color} ${stat.bgColor} px-2 py-1 rounded-full`}>
                      {stat.badge}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Returns */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Pending Returns</h3>
                    <p className="text-sm text-slate-500">Returns awaiting your review</p>
                  </div>
                </div>
                <Link href="/admin/returns">
                  <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                    Manage All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-5">
              {pendingReturns.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-500">All caught up! No pending returns.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReturns.slice(0, 5).map((ret: any) => (
                    <div
                      key={ret._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <RefreshCw className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ret.reason}</p>
                          <p className="text-sm text-slate-500">
                            {ret.returnMethod} • {new Date(ret.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={ret.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Return Method Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Return Methods</h3>
                  <p className="text-sm text-slate-500">Distribution by return type</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {returns.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No return data available yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    { method: "pickup", label: "Home Pickup", color: "bg-blue-500", icon: <Zap className="h-4 w-4" /> },
                    { method: "dropbox", label: "Drop Box", color: "bg-emerald-500", icon: <Package className="h-4 w-4" /> },
                    { method: "courier", label: "Courier", color: "bg-purple-500", icon: <Users className="h-4 w-4" /> }
                  ].map(({ method, label, color, icon }) => {
                    const count = returns.filter(
                      (r: { returnMethod: string }) => r.returnMethod === method
                    ).length;
                    const pct = returns.length > 0 ? (count / returns.length) * 100 : 0;
                    
                    return (
                      <div key={method}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${color.replace('bg-', 'bg-').replace('500', '100')}`}>
                              <div className={`${color.replace('bg-', 'text-').replace('500', '600')}`}>
                                {icon}
                              </div>
                            </div>
                            <span className="font-medium text-slate-900">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{count}</span>
                            <span className="text-xs text-slate-500">({pct.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-500 shadow-sm`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
