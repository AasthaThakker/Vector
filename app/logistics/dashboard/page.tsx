"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Navigation,
  QrCode,
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
      color: "text-amber-500",
    },
    {
      label: "Pickup Scheduled",
      value: pickupScheduled.length,
      icon: <Clock className="h-5 w-5" />,
      color: "text-blue-500",
    },
    {
      label: "In Transit",
      value: inTransit.length,
      icon: <Truck className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Delivered to Warehouse",
      value: delivered.length,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Logistics Dashboard</h1>
        <p className="text-muted-foreground">
          Manage pickup scheduling, tracking, and delivery to warehouse.
        </p>
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

      {/* Awaiting pickup assignment */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Assign Pickups</h2>
        </div>
        {approvedForPickup.length === 0 ? (
          <p className="text-sm text-muted-foreground">No returns awaiting pickup assignment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {approvedForPickup.map(
              (ret: {
                _id: string;
                reason: string;
                status: string;
                pickupAddress?: string;
                qrCodeData?: string;
              }) => (
                <div
                  key={ret._id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {ret.pickupAddress || "Address pending"} &middot; ID: {ret._id.slice(-8)}
                      </p>
                    </div>
                    {ret.qrCodeData && (
                      <div className="flex flex-col items-center gap-1">
                        <img 
                          src={ret.qrCodeData} 
                          alt="Return QR Code" 
                          className="w-12 h-12 border border-background rounded"
                        />
                        <span className="text-xs text-muted-foreground">QR</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(ret._id, "pickup_scheduled")}
                    className="gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    Schedule
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scheduled pickups */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Scheduled Pickups</h2>
          </div>
          {pickupScheduled.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scheduled pickups.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pickupScheduled.map(
                (ret: {
                  _id: string;
                  reason: string;
                  pickupAddress?: string;
                  qrCodeData?: string;
                }) => (
                  <div
                    key={ret._id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {ret._id.slice(-8)}
                        </p>
                      </div>
                      {ret.qrCodeData && (
                        <div className="flex flex-col items-center gap-1">
                          <img 
                            src={ret.qrCodeData} 
                            alt="Return QR Code" 
                            className="w-12 h-12 border border-background rounded"
                          />
                          <span className="text-xs text-muted-foreground">QR</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStatusUpdate(ret._id, "pickup_completed")
                      }
                      className="gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Picked Up
                    </Button>
                  </div>
                )
              )}
            </div>
          )}
        </GlassCard>

        {/* In transit */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-foreground">In Transit</h2>
          </div>
          {inTransit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items currently in transit.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {inTransit.map(
                (ret: {
                  _id: string;
                  reason: string;
                  status: string;
                  returnMethod: string;
                  qrCodeData?: string;
                }) => (
                  <div
                    key={ret._id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {ret.returnMethod} &middot; ID: {ret._id.slice(-8)}
                        </p>
                      </div>
                      {ret.qrCodeData && (
                        <div className="flex flex-col items-center gap-1">
                          <img 
                            src={ret.qrCodeData} 
                            alt="Return QR Code" 
                            className="w-12 h-12 border border-background rounded"
                          />
                          <span className="text-xs text-muted-foreground">QR</span>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={ret.status} />
                  </div>
                )
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
