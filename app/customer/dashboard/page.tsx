"use client";

import useSWR from "swr";
import { useAuth } from "@/lib/useAuth";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  RotateCcw,
  Clock,
  CheckCircle,
  User,
  ShoppingBag,
  ChevronRight,
  TrendingUp,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: ordersData } = useSWR("/api/orders", fetcher);
  const { data: returnsData } = useSWR("/api/returns", fetcher);

  const orders = ordersData?.orders || [];
  const returns = returnsData?.returns || [];

  const activeReturns = returns.filter((r: { status: string }) => !["completed", "rejected"].includes(r.status));
  const pendingReturns = returns.filter((r: { status: string }) => r.status === "pending");
  const completedReturns = returns.filter((r: { status: string }) => r.status === "completed");

  const stats = [
    { 
      label: "Total Orders", 
      value: orders.length, 
      icon: <ShoppingBag className="h-5 w-5" />, 
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-400/20 to-indigo-400/10"
    },
    { 
      label: "Active Returns", 
      value: activeReturns.length, 
      icon: <RotateCcw className="h-5 w-5" />, 
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      gradient: "from-amber-400/20 to-orange-400/10",
      badge: activeReturns.length > 0 ? "In Progress" : null
    },
    { 
      label: "Pending", 
      value: pendingReturns.length, 
      icon: <Clock className="h-5 w-5" />, 
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      gradient: "from-orange-400/20 to-red-400/10"
    },
    { 
      label: "Completed", 
      value: completedReturns.length, 
      icon: <CheckCircle className="h-5 w-5" />, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      gradient: "from-emerald-400/20 to-green-400/10"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Welcome back, {user?.name}
              </h1>
              <p className="text-slate-500 text-sm">
                Track your orders and manage returns
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Apple/Amazon Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Recent Orders</h3>
                    <p className="text-sm text-slate-500">Your latest purchases</p>
                  </div>
                </div>
                <Link href="/customer/orders">
                  <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-5">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No orders yet</p>
                  <p className="text-sm text-slate-400 mt-1">Start shopping to see your orders here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: any) => (
                    <div 
                      key={order._id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.products.map((p: { name: string }) => p.name).join(", ")}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Returns */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                    <RotateCcw className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Active Returns</h3>
                    <p className="text-sm text-slate-500">Track your return requests</p>
                  </div>
                </div>
                <Link href="/customer/returns">
                  <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-5">
              {returns.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-500">No return requests</p>
                  <p className="text-sm text-slate-400 mt-1">All your items are perfect!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {returns.slice(0, 3).map((ret: any) => (
                    <div 
                      key={ret._id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <RotateCcw className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ret.reason}</p>
                          <p className="text-sm text-slate-500 capitalize">
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/customer/orders">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Browse Orders</h4>
                  <p className="text-sm text-slate-500">View your order history</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/customer/returns">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Request Return</h4>
                  <p className="text-sm text-slate-500">Start a new return process</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
