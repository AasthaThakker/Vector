"use client";

import useSWR from "swr";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Shirt, Truck, Calendar, User, FileText, ChevronRight, Star, MessageSquare } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categoryIcons: Record<string, React.ReactNode> = {
  tshirt: <Shirt className="h-6 w-6 text-primary" />,
  shoes: <Package className="h-6 w-6 text-amber-500" />,
  hoodie: <Package className="h-6 w-6 text-emerald-500" />,
};

export default function CustomerOrders() {
  const { data, isLoading } = useSWR("/api/orders", fetcher);
  const orders = data?.orders || [];

  // Extract unique products for "Buy it again" sidebar
  const allProducts = orders.flatMap(order => order.products);
  const uniqueProducts = Array.from(
    new Map(allProducts.map(product => [product.productId, product])).values()
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600">Track, return, or buy items again</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">No orders found</h2>
            <p className="mt-2 text-gray-600">You haven't placed any orders yet.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Main Content - Orders List */}
            <div className="flex-1">
              <div className="space-y-6">
                {orders.map(
                  (order: {
                    _id: string;
                    products: { productId: string; name: string; category: string; size: string; color: string; price: number }[];
                    status: string;
                    orderDate: string;
                    totalAmount: number;
                  }) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {/* Order Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {new Date(order.orderDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Delivered to: You</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  Order #{order._id.slice(-8).toUpperCase()}
                                </span>
                                <StatusBadge status={order.status} />
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Total: {"Rs."}{order.totalAmount}</span>
                                {order.status === "delivered" && (
                                  <span className="text-green-600 font-medium">• Delivered</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Invoice
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              View order details
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {order.products.map((product, index) => (
                            <div key={`${product.productId}-${product.size}-${product.color}-${index}`} className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {categoryIcons[product.category] || <Package className="h-8 w-8 text-gray-400" />}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {product.size} &middot; {product.color} &middot; {product.category}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{"Rs."}{product.price}</p>
                              </div>
                              <div className="flex-shrink-0">
                                {order.status === "delivered" ? (
                                  <div className="space-y-2">
                                    <Link
                                      href={`/customer/returns?orderId=${order._id}&products=${encodeURIComponent(
                                        JSON.stringify(order.products)
                                      )}`}
                                    >
                                      <Button size="sm" variant="outline">
                                        Return or replace item
                                      </Button>
                                    </Link>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        Feedback
                                      </Button>
                                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        Review
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-blue-600 font-medium">
                                      {order.status === "processing" ? "Processing" : 
                                       order.status === "shipped" ? "Shipped" : 
                                       order.status === "cancelled" ? "Cancelled" : "Pending"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Status Messages */}
                      {order.status === "cancelled" && (
                        <div className="px-6 pb-6">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-medium">Order Cancelled</p>
                            <p className="text-red-600 text-sm mt-1">This order was cancelled and will not be processed.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Sidebar - Buy it again */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Buy it again</h2>
                <div className="space-y-4">
                  {uniqueProducts.map((product) => (
                    <div key={product.productId} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {categoryIcons[product.category] || <Package className="h-6 w-6 text-gray-400" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{"Rs."}{product.price}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                          Add to cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
