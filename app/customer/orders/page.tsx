"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Shirt } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categoryIcons: Record<string, React.ReactNode> = {
  tshirt: <Shirt className="h-8 w-8 text-primary" />,
  shoes: <Package className="h-8 w-8 text-amber-500" />,
  hoodie: <Package className="h-8 w-8 text-emerald-500" />,
};

export default function CustomerOrders() {
  const { data, isLoading } = useSWR("/api/orders", fetcher);
  const orders = data?.orders || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">View all your orders and request returns.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders found. Seed demo data from the home page.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(
            (order: {
              _id: string;
              products: { productId: string; name: string; category: string; size: string; color: string; price: number }[];
              status: string;
              orderDate: string;
              totalAmount: number;
            }) => (
              <GlassCard key={order._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <div className="mt-4 flex flex-col gap-3">
                      {order.products.map((product, index) => (
                        <div
                          key={`${product.productId}-${product.size}-${product.color}-${index}`}
                          className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                            {categoryIcons[product.category] || <Package className="h-8 w-8 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.size} &middot; {product.color} &middot; {product.category}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {"Rs."}{product.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-lg font-bold text-foreground">{"Rs."}{order.totalAmount}</p>
                    {order.status === "delivered" && (
                      <Link
                        href={`/customer/returns?orderId=${order._id}&products=${encodeURIComponent(
                          JSON.stringify(order.products)
                        )}`}
                      >
                        <Button size="sm" variant="outline">
                          Request Return
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          )}
        </div>
      )}
    </div>
  );
}
