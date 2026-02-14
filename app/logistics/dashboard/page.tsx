"use client";

import useSWR from "swr";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Navigation,
  Route,
  ChevronRight,
  Zap
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LogisticsDashboard() {
  const { data, mutate } = useSWR("/api/returns?all=true", fetcher);

  const returns = data?.returns || [];

  const approvedForPickup = returns.filter(
    (r: { status: string; returnMethod: string }) =>
      r.status === "approved" && r.returnMethod === "pickup"
  );
  const pickupScheduled = returns.filter(
    (r: { status: string }) => r.status === "pickup_scheduled"
  );
  const inTransit = returns.filter(
    (r: { status: string }) =>
      r.status === "pickup_completed" || r.status === "dropbox_received"
  );
  const delivered = returns.filter(
    (r: { status: string }) => r.status === "warehouse_received"
  );

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Status updated to ${status.replace(/_/g, " ")}`);
      mutate();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const stats = [
    {
      label: "Awaiting Pickup",
      value: approvedForPickup.length,
      icon: <MapPin className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      gradient: "from-amber-400/20 to-orange-400/10",
      badge: approvedForPickup.length > 0 ? "Needs Assignment" : null
    },
    {
      label: "Pickup Scheduled",
      value: pickupScheduled.length,
      icon: <Clock className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-400/20 to-indigo-400/10",
      badge: null
    },
    {
      label: "In Transit",
      value: inTransit.length,
      icon: <Truck className="h-5 w-5" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      gradient: "from-cyan-400/20 to-teal-400/10",
      badge: null
    },
    {
      label: "Delivered",
      value: delivered.length,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      gradient: "from-emerald-400/20 to-green-400/10",
      badge: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <Route className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Logistics Dashboard
              </h1>
              <p className="text-slate-500 text-sm">
                Manage pickup scheduling, tracking, and delivery
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

        {/* Awaiting pickup assignment */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Assign Pickups</h3>
                  <p className="text-sm text-slate-500">Schedule pickups for approved returns</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-5">
            {approvedForPickup.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-500">No returns awaiting pickup assignment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedForPickup.map((ret: any) => (
                  <div
                    key={ret._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{ret.reason}</p>
                        <p className="text-sm text-slate-500">
                          {ret.pickupAddress || "Address pending"} • ID: {ret._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(ret._id, "pickup_scheduled")}
                      className="gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                      <Clock className="h-3 w-3" />
                      Schedule
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Scheduled pickups */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Scheduled Pickups</h3>
                  <p className="text-sm text-slate-500">Ready for pickup assignment</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {pickupScheduled.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No scheduled pickups</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pickupScheduled.map((ret: any) => (
                    <div
                      key={ret._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ret.reason}</p>
                          <p className="text-sm text-slate-500">ID: {ret._id.slice(-8)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(ret._id, "pickup_completed")}
                        className="gap-1 border-blue-200 hover:bg-blue-50"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Picked Up
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* In transit */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl shadow-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">In Transit</h3>
                  <p className="text-sm text-slate-500">Items currently being transported</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {inTransit.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No items currently in transit</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inTransit.map((ret: any) => (
                    <div
                      key={ret._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-cyan-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <Zap className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ret.reason}</p>
                          <p className="text-sm text-slate-500 capitalize">
                            {ret.returnMethod} • ID: {ret._id.slice(-8)}
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
      </div>
    </div>
  );
}
