"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Warehouse,
  Package,
  CheckCircle,
  ArrowRight,
  QrCode,
  ScanLine,
} from "lucide-react";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function WarehouseDashboard() {
  const { data: returnsData, mutate } = useSWR("/api/returns?all=true", fetcher);
  const { data: inventoryData, mutate: mutateInv } = useSWR("/api/inventory?limit=50", fetcher);
  const [scanInput, setScanInput] = useState("");

  const returns = returnsData?.returns || [];
  const inventory = inventoryData?.items || [];

  const inTransit = returns.filter(
    (r: { status: string }) =>
      r.status === "pickup_completed" || r.status === "dropbox_received"
  );
  const warehouseReceived = returns.filter(
    (r: { status: string }) => r.status === "warehouse_received"
  );
  const approvedForPickup = returns.filter(
    (r: { status: string }) => r.status === "approved"
  );

  const handleReceive = async (id: string) => {
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "warehouse_received" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Item marked as received in warehouse");
      mutate();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleQC = async (id: string, pass: boolean) => {
    try {
      const status = pass ? "refund_initiated" : "rejected";
      const res = await fetch(`/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(pass ? "QC passed, refund initiated" : "QC failed, return rejected");
      mutate();
      mutateInv();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleScan = () => {
    const found = returns.find(
      (r: { _id: string }) => r._id === scanInput || r._id.endsWith(scanInput)
    );
    if (found) {
      handleReceive(found._id);
      setScanInput("");
    } else {
      toast.error("Return not found with that ID");
    }
  };

  const stats = [
    {
      label: "In Transit",
      value: inTransit.length,
      icon: <Package className="h-5 w-5" />,
      color: "text-amber-500",
    },
    {
      label: "Received",
      value: warehouseReceived.length,
      icon: <Warehouse className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Awaiting Pickup",
      value: approvedForPickup.length,
      icon: <ArrowRight className="h-5 w-5" />,
      color: "text-blue-500",
    },
    {
      label: "Inventory Items",
      value: inventoryData?.pagination?.total || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Warehouse Dashboard</h1>
        <p className="text-muted-foreground">
          Manage incoming returns, QC inspection, and inventory.
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

      {/* QR / ID Scanner */}
      <GlassCard>
        <div className="flex items-center gap-3">
          <QrCode className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Scan Return</h2>
        </div>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Enter a return ID to mark it as received in the warehouse.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Return ID or last 8 chars..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button onClick={handleScan} disabled={!scanInput}>
            Receive
          </Button>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Items in transit */}
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">In Transit to Warehouse</h2>
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
                }) => (
                  <div
                    key={ret._id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {ret.returnMethod} &middot; ID: {ret._id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ret.status} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReceive(ret._id)}
                      >
                        Receive
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </GlassCard>

        {/* QC Inspection */}
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">QC Inspection Queue</h2>
          {warehouseReceived.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items awaiting quality check.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {warehouseReceived.map(
                (ret: { _id: string; reason: string; returnMethod: string }) => (
                  <div
                    key={ret._id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{ret.reason}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {ret.returnMethod} &middot; ID: {ret._id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleQC(ret._id, true)}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQC(ret._id, false)}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Inventory */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Fashion Inventory</h2>
          <div className="text-sm text-muted-foreground">
            Showing {inventory.length} of {inventoryData?.pagination?.total || 0} items
          </div>
        </div>
        {inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inventory items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Product</th>
                  <th className="pb-2 pr-4 font-medium">Brand</th>
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">Size/Color</th>
                  <th className="pb-2 pr-4 font-medium">Price</th>
                  <th className="pb-2 pr-4 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(
                  (item: {
                    _id: string;
                    productName: string;
                    brand: string;
                    category: string;
                    size: string;
                    color: string;
                    price: number;
                    salePrice?: number;
                    stock: number;
                    minStock: number;
                    material: string;
                    season: string;
                    gender: string;
                  }) => {
                    const getStockStatus = (stock: number, minStock: number) => {
                      if (stock === 0) return { status: "Out of Stock", color: "text-red-600" };
                      if (stock <= minStock) return { status: "Low Stock", color: "text-amber-600" };
                      return { status: "In Stock", color: "text-green-600" };
                    };
                    
                    const stockStatus = getStockStatus(item.stock, item.minStock);
                    
                    return (
                      <tr key={item._id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <div>
                            <div className="font-medium text-foreground text-sm">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.material} &middot; {item.season}</div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-foreground">{item.brand}</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-sm">
                            <div className="text-foreground">{item.size}</div>
                            <div className="text-muted-foreground">{item.color}</div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div>
                            <div className="font-medium text-foreground">Rs.{item.price}</div>
                            {item.salePrice && (
                              <div className="text-sm text-green-600">Rs.{item.salePrice}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-center">
                            <div className="font-medium text-foreground">{item.stock}</div>
                            <div className="text-xs text-muted-foreground">Min: {item.minStock}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
