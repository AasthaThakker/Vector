"use client";

import useSWR from "swr";
import { StatusBadge } from "@/components/status-badge";
import { 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Package, 
  Truck, 
  QrCode, 
  Warehouse, 
  CreditCard, 
  Box,
  Calendar,
  Clock,
  ArrowRight,
  PackageOpen,
  ScanLine,
  Home,
  Building2,
  Sparkles,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Universal color sequence: Blue → Amber → Emerald → Cyan → Purple → Rose
const statusFlow = [
  { key: "pending", label: "Return Requested", color: "blue", icon: FileText, description: "Your return request has been submitted" },
  { key: "approved", label: "Request Approved", color: "amber", icon: Sparkles, description: "Return has been approved by admin" },
  { key: "pickup_scheduled", label: "Pickup Scheduled", color: "emerald", icon: Calendar, description: "Pickup has been scheduled" },
  { key: "pickup_completed", label: "Pickup Completed", color: "cyan", icon: Truck, description: "Item picked up by logistics partner" },
  { key: "dropbox_received", label: "Dropbox Received", color: "cyan", icon: ScanLine, description: "Item received at dropbox location" },
  { key: "warehouse_received", label: "At Warehouse", color: "purple", icon: Warehouse, description: "Item received and being inspected" },
  { key: "refund_initiated", label: "Refund Processing", color: "rose", icon: CreditCard, description: "Refund is being processed" },
  { key: "completed", label: "Return Completed", color: "emerald", icon: CheckCircle2, description: "Return process completed successfully" },
];

const colorMap: Record<string, { bg: string; text: string; border: string; line: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", line: "bg-blue-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", line: "bg-amber-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", line: "bg-emerald-500" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", line: "bg-cyan-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", line: "bg-purple-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", line: "bg-rose-500" },
};

function TrackingTimeline({ status, method, createdAt }: { status: string; method: string; createdAt: string }) {
  const applicableSteps = statusFlow.filter((s) => {
    if (method === "pickup") {
      return s.key !== "dropbox_received";
    }
    return !["pickup_scheduled", "pickup_completed"].includes(s.key);
  });

  const currentIndex = applicableSteps.findIndex((s) => s.key === status);

  return (
    <div className="relative">
      {applicableSteps.map((step, idx) => {
        const isComplete = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        const isUpcoming = idx > currentIndex;
        const colors = colorMap[step.color];
        const Icon = step.icon;

        return (
          <div key={step.key} className="relative flex gap-4">
            {/* Timeline line */}
            {idx < applicableSteps.length - 1 && (
              <div 
                className={cn("absolute left-5 top-10 w-0.5 h-full", isComplete ? colors.line : "bg-slate-200")} 
                style={{ height: "calc(100% - 20px)" }}
              />
            )}
            
            {/* Icon/Step indicator */}
            <div className="relative z-10 flex-shrink-0">
              <div 
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isComplete 
                    ? cn(colors.bg, colors.border, colors.text) 
                    : isCurrent
                    ? cn("bg-white", colors.border, colors.text, "shadow-lg", `shadow-${step.color}-500/20`)
                    : "bg-slate-50 border-slate-200 text-slate-300"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-8", isUpcoming && "opacity-50")}>
              <div className="flex items-center gap-2">
                <h4 className={cn("font-semibold", (isComplete || isCurrent) ? "text-slate-900" : "text-slate-400")}>
                  {step.label}
                </h4>
                {isCurrent && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p className={cn("text-sm mt-1", (isComplete || isCurrent) ? "text-slate-600" : "text-slate-400")}>
                {step.description}
              </p>
              {isCurrent && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>Updated {createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReturnCard({ ret }: { ret: any }) {
  const colors = colorMap["blue"];
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Return Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  Return #{ret._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-slate-500">
                  {new Date(ret.createdAt).toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </p>
              </div>
            </div>

            {/* Product Details - Clean 2-line format */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Product</p>
                  <p className="font-medium text-slate-900 text-sm">
                    {ret.productName || "Blue Denim Jeans"}
                  </p>
                  <p className="text-sm text-slate-500">Size L • $45.00</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-sm text-slate-900 capitalize">
                    {ret.reason?.replace(/_/g, ' ') || "Wrong size"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status Badge */}
          <div className="flex-shrink-0">
            <StatusBadge status={ret.status} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <TrackingTimeline 
          status={ret.status} 
          method={ret.returnMethod} 
          createdAt={ret.createdAt}
        />
      </div>

      {/* Action Cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Return Method Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              {ret.returnMethod === "pickup" ? (
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Home className="h-4 w-4 text-emerald-600" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-amber-600" />
                </div>
              )}
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Method
              </span>
            </div>
            <p className="font-medium text-slate-900">
              {ret.returnMethod === "pickup" ? "Home Pickup" : "Drop Box"}
            </p>
            {ret.returnMethod === "dropbox" && ret.dropboxLocation && (
              <p className="text-xs text-slate-500 mt-1">{ret.dropboxLocation}</p>
            )}
          </div>

          {/* QR Code for Dropbox */}
          {ret.returnMethod === "dropbox" && ret.qrCodeData ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  QR Code
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ret.qrCodeData} alt="QR Code" className="h-12 w-12 rounded-lg border border-slate-200" />
                <p className="text-xs text-slate-500">Scan at dropbox</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Tracking
                </span>
              </div>
              <p className="font-medium text-slate-900">
                {ret.status === "pickup_scheduled" ? "Driver assigned" : "In transit"}
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        {ret.status !== "completed" && ret.status !== "rejected" && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Estimated Completion</p>
                <p className="text-sm text-slate-600 mt-1">
                  Your return should be completed within 2-3 business days from now.
                </p>
                <Button variant="link" className="p-0 h-auto text-blue-600 text-sm mt-2">
                  Need help? Contact support
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerTrack() {
  const { data, isLoading } = useSWR("/api/returns", fetcher);
  const returns = data?.returns || [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Track Returns</h1>
              <p className="text-slate-600">Monitor the status of your return requests in real-time</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="mt-4 text-slate-500">Loading your returns...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <PackageOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Returns</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              You don't have any returns to track at the moment. Start a return from your orders page.
            </p>
            <Link href="/customer/orders">
              <Button className="bg-slate-900 hover:bg-slate-800">
                View Orders
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {returns.map((ret: any) => (
              <ReturnCard key={ret._id} ret={ret} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
