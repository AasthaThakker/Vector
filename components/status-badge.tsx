"use client";

import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  pickup_scheduled: "bg-blue-100 text-blue-800",
  pickup_completed: "bg-blue-200 text-blue-900",
  dropbox_received: "bg-teal-100 text-teal-800",
  warehouse_received: "bg-indigo-100 text-indigo-800",
  refund_initiated: "bg-cyan-100 text-cyan-800",
  completed: "bg-emerald-200 text-emerald-900",
  delivered: "bg-emerald-100 text-emerald-800",
  shipped: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  pickup_scheduled: "Pickup Scheduled",
  pickup_completed: "Pickup Completed",
  dropbox_received: "Dropbox Received",
  warehouse_received: "Warehouse Received",
  refund_initiated: "Refund Initiated",
  completed: "Completed",
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColors[status] || "bg-muted text-muted-foreground"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
