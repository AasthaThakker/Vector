"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { CheckCircle, Circle, MapPin } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusFlow = [
  "pending",
  "approved",
  "pickup_scheduled",
  "pickup_completed",
  "dropbox_received",
  "warehouse_received",
  "refund_initiated",
  "completed",
];

const statusFlowLabels: Record<string, string> = {
  pending: "Return Requested",
  approved: "Request Approved",
  pickup_scheduled: "Pickup Scheduled",
  pickup_completed: "Pickup Completed",
  dropbox_received: "Dropped at Box",
  warehouse_received: "Received at Warehouse",
  refund_initiated: "Refund Processing",
  completed: "Return Completed",
};

function TrackingTimeline({ status, method }: { status: string; method: string }) {
  const applicableSteps = statusFlow.filter((s) => {
    if (method === "pickup") {
      return !["dropbox_received"].includes(s);
    }
    return !["pickup_scheduled", "pickup_completed"].includes(s);
  });

  const currentIndex = applicableSteps.indexOf(status);

  return (
    <div className="flex flex-col gap-0">
      {applicableSteps.map((step, idx) => {
        const isComplete = idx <= currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isComplete ? (
                <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-500"}`} />
              ) : (
                <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground/30" />
              )}
              {idx < applicableSteps.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-8 ${isComplete ? "bg-emerald-500" : "bg-muted-foreground/20"}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isComplete ? "text-foreground" : "text-muted-foreground/50"}`}>
                {statusFlowLabels[step]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerTrack() {
  const { data, isLoading } = useSWR("/api/returns", fetcher);
  const returns = data?.returns || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Track Returns</h1>
        <p className="text-muted-foreground">Follow the status of your return requests.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : returns.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No active returns to track.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {returns.map((ret: {
            _id: string;
            reason: string;
            status: string;
            returnMethod: string;
            dropboxLocation: string;
            createdAt: string;
            qrCodeData: string;
          }) => (
            <GlassCard key={ret._id}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Return #{ret._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{ret.reason}</p>
                </div>
                <StatusBadge status={ret.status} />
              </div>

              <TrackingTimeline status={ret.status} method={ret.returnMethod} />

              {ret.returnMethod === "dropbox" && ret.qrCodeData && (
                <div className="mt-2 flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ret.qrCodeData} alt="QR Code" className="h-12 w-12 rounded" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Drop-Box QR Code</p>
                    <p className="text-xs text-muted-foreground">{ret.dropboxLocation || "Any location"}</p>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
