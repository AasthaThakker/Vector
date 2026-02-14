"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminReturns() {
  const { data, mutate } = useSWR("/api/returns?all=true", fetcher);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const returns = data?.returns || [];

  const filtered = returns.filter((r: { reason: string; status: string; _id: string }) => {
    const matchesSearch =
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r._id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Return ${action} successfully`);
      mutate();
      setSelected(null);
    } catch {
      toast.error("Failed to update return status");
    }
  };

  const selectedReturn = returns.find((r: { _id: string }) => r._id === selected);

  const statuses = [
    "all",
    "pending",
    "approved",
    "rejected",
    "pickup_scheduled",
    "pickup_completed",
    "dropbox_received",
    "warehouse_received",
    "refund_initiated",
    "completed",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Manage Returns</h1>
        <p className="text-muted-foreground">Review, approve, or reject customer return requests.</p>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by reason or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <GlassCard>
                <p className="text-center text-sm text-muted-foreground">No returns found.</p>
              </GlassCard>
            ) : (
              filtered.map(
                (ret: {
                  _id: string;
                  reason: string;
                  status: string;
                  returnMethod: string;
                  createdAt: string;
                  orderId?: { products?: { name: string }[] };
                }) => (
                  <GlassCard
                    key={ret._id}
                    className={`cursor-pointer transition-all ${
                      selected === ret._id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <button
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => setSelected(ret._id === selected ? null : ret._id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                          <StatusBadge status={ret.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground capitalize">
                          {ret.returnMethod} &middot; {new Date(ret.createdAt).toLocaleDateString()} &middot;
                          ID: {ret._id.slice(-8)}
                        </p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </GlassCard>
                )
              )
            )}
          </div>
        </div>

        <div>
          {selectedReturn ? (
            <GlassCard className="sticky top-20">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Return Details</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Return ID</p>
                  <p className="font-mono text-xs text-foreground">{selectedReturn._id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reason</p>
                  <p className="text-foreground">{selectedReturn.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <p className="capitalize text-foreground">{selectedReturn.returnMethod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedReturn.status} />
                </div>
                {selectedReturn.aiAnalysis && (
                  <div>
                    <p className="text-muted-foreground">AI Analysis</p>
                    <p className="text-foreground">{selectedReturn.aiAnalysis}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="text-foreground">
                    {new Date(selectedReturn.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedReturn.status === "pending" && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(selectedReturn._id, "approved")}
                      className="flex-1 gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(selectedReturn._id, "rejected")}
                      className="flex-1 gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="sticky top-20">
              <p className="text-center text-sm text-muted-foreground">
                Select a return to view details
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
