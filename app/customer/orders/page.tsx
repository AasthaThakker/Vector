"use client";



import useSWR from "swr";

import { StatusBadge } from "@/components/status-badge";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import Link from "next/link";

import { 

  Package, 

  Shirt, 

  Truck, 

  Calendar, 

  User, 

  FileText, 

  ChevronRight, 

  Star, 

  MessageSquare,

  ShoppingBag,

  MapPin,

  RefreshCw,

  CheckCircle,

  AlertCircle

} from "lucide-react";



const fetcher = (url: string) => fetch(url).then((r) => r.json());



// Type definitions

interface Product {

  productId: string;

  name: string;

  category: string;

  price: number;

  size: string;

  color: string;

}



interface Order {

  _id: string;

  status: string;

  orderDate: string;

  totalAmount: number;

  products: Product[];

}



// Category color mapping - Amazon/Apple inspired

const categoryColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {

  tshirt: { bg: "bg-blue-50", text: "text-blue-600", icon: <Shirt className="h-6 w-6" /> },

  shirt: { bg: "bg-indigo-50", text: "text-indigo-600", icon: <Shirt className="h-6 w-6" /> },

  pants: { bg: "bg-slate-50", text: "text-slate-600", icon: <Package className="h-6 w-6" /> },

  jeans: { bg: "bg-cyan-50", text: "text-cyan-600", icon: <Package className="h-6 w-6" /> },

  dress: { bg: "bg-pink-50", text: "text-pink-600", icon: <Package className="h-6 w-6" /> },

  jacket: { bg: "bg-amber-50", text: "text-amber-600", icon: <Package className="h-6 w-6" /> },

  hoodie: { bg: "bg-purple-50", text: "text-purple-600", icon: <Package className="h-6 w-6" /> },

  sweater: { bg: "bg-orange-50", text: "text-orange-600", icon: <Package className="h-6 w-6" /> },

  shorts: { bg: "bg-yellow-50", text: "text-yellow-600", icon: <Package className="h-6 w-6" /> },

  skirt: { bg: "bg-rose-50", text: "text-rose-600", icon: <Package className="h-6 w-6" /> },

  blazer: { bg: "bg-emerald-50", text: "text-emerald-600", icon: <Package className="h-6 w-6" /> },

  coat: { bg: "bg-gray-50", text: "text-gray-600", icon: <Package className="h-6 w-6" /> },

  polo: { bg: "bg-teal-50", text: "text-teal-600", icon: <Shirt className="h-6 w-6" /> },

  tanktop: { bg: "bg-sky-50", text: "text-sky-600", icon: <Shirt className="h-6 w-6" /> },

  cardigan: { bg: "bg-violet-50", text: "text-violet-600", icon: <Package className="h-6 w-6" /> },

  shoes: { bg: "bg-amber-50", text: "text-amber-600", icon: <Package className="h-6 w-6" /> },

};



export default function CustomerOrders() {

  const { data, isLoading } = useSWR("/api/orders", fetcher);

  const orders = data?.orders || [];



  // Extract unique products for "Buy it again" sidebar

  const allProducts = orders.flatMap((order: Order) => order.products);

  const uniqueProducts = Array.from(

    new Map(allProducts.map((product: Product) => [product.productId, product])).values()

  ).slice(0, 6);



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}

        <div className="mb-8">

          <div className="flex items-center gap-3 mb-2">

            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">

              <ShoppingBag className="h-6 w-6 text-white" />

            </div>

            <div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">

                Your Orders

              </h1>

              <p className="text-slate-500 text-sm">

                Track, return, or buy items again

              </p>

            </div>

          </div>

        </div>



        {isLoading ? (

          <div className="flex justify-center py-12">

            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          </div>

        ) : orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">

            <Package className="mx-auto h-16 w-16 text-slate-300" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">No orders found</h2>

            <p className="mt-2 text-slate-500">You haven't placed any orders yet.</p>

            <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" onClick={() => window.location.href = '/'}>

              Start Shopping

            </Button>

          </div>

        ) : (

          <div className="flex gap-8">

            {/* Main Content - Orders List */}

            <div className="flex-1">

              <div className="space-y-6">

                {orders.map((order: any) => (

                  <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all">

                    {/* Order Header */}

                    <div className="p-6 border-b border-slate-100">

                      <div className="flex items-start justify-between">

                        <div className="flex-1">

                          <div className="flex items-center gap-4 mb-3">

                            <div className="flex items-center gap-2">

                              <Calendar className="h-4 w-4 text-slate-400" />

                              <span className="text-sm text-slate-600">

                                {new Date(order.orderDate).toLocaleDateString("en-US", {

                                  year: "numeric",

                                  month: "long",

                                  day: "numeric",

                                })}

                              </span>

                            </div>

                            <div className="flex items-center gap-2">

                              <MapPin className="h-4 w-4 text-slate-400" />

                              <span className="text-sm text-slate-600">Delivered to You</span>

                            </div>

                          </div>

                          

                          <div className="flex items-center gap-4">

                            <div className="flex items-center gap-2">

                              <span className="font-semibold text-slate-900">

                                Order #{order._id.slice(-8).toUpperCase()}

                              </span>

                              <StatusBadge status={order.status} />

                            </div>

                            

                            <div className="flex items-center gap-2 text-sm text-slate-600">

                              <span className="font-medium">Rs.{order.totalAmount.toLocaleString()}</span>

                              {order.status === "delivered" && (

                                <span className="text-emerald-600 font-medium flex items-center gap-1">

                                  <CheckCircle className="h-3 w-3" />

                                  Delivered

                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                        

                        <div className="flex items-center gap-2">

                          <Button variant="outline" size="sm" className="flex items-center gap-1 border-slate-200 hover:bg-slate-50">

                            <FileText className="h-4 w-4" />

                            Invoice

                          </Button>

                          <Button variant="outline" size="sm" className="flex items-center gap-1 border-slate-200 hover:bg-slate-50">

                            View details

                            <ChevronRight className="h-4 w-4" />

                          </Button>

                        </div>

                      </div>

                    </div>



                    {/* Products */}

                    <div className="p-6">

                      <div className="space-y-4">

                        {order.products.map((product: any, index: number) => {

                          const categoryStyle = categoryColors[product.category] || { bg: "bg-slate-50", text: "text-slate-600", icon: <Package className="h-6 w-6" /> };

                          

                          return (

                            <div key={`${product.productId}-${product.size}-${product.color}-${index}`} className="flex gap-4">

                              <div className="flex-shrink-0">

                                <div className={`w-16 h-16 ${categoryStyle.bg} rounded-xl flex items-center justify-center border border-slate-100`}>

                                  <div className={categoryStyle.text}>

                                    {categoryStyle.icon}

                                  </div>

                                </div>

                              </div>

                              <div className="flex-1">

                                <h3 className="font-semibold text-slate-900">{product.name}</h3>

                                <p className="text-sm text-slate-500 mt-1">

                                  {product.size} &middot; {product.color} &middot; <span className="capitalize">{product.category}</span>

                                </p>

                                <p className="text-sm font-semibold text-slate-900 mt-1">Rs.{product.price.toLocaleString()}</p>

                              </div>

                              <div className="flex-shrink-0">

                                {order.status === "delivered" ? (

                                  <div className="space-y-2">

                                    <Link

                                      href={`/customer/returns?orderId=${order._id}&products=${encodeURIComponent(

                                        JSON.stringify(order.products)

                                      )}`}

                                    >

                                      <Button size="sm" variant="outline" className="border-amber-200 hover:bg-amber-50">

                                        <RefreshCw className="h-3 w-3 mr-1" />

                                        Return

                                      </Button>

                                    </Link>

                                    <div className="flex gap-2">

                                      <Button size="sm" variant="ghost" className="flex items-center gap-1 text-slate-500 hover:text-slate-700">

                                        <MessageSquare className="h-4 w-4" />

                                        Feedback

                                      </Button>

                                      <Button size="sm" variant="ghost" className="flex items-center gap-1 text-slate-500 hover:text-slate-700">

                                        <Star className="h-4 w-4" />

                                        Review

                                      </Button>

                                    </div>

                                  </div>

                                ) : (

                                  <div className="flex items-center gap-2">

                                    <Truck className="h-4 w-4 text-blue-600" />

                                    <span className="text-sm text-blue-600 font-medium capitalize">

                                      {order.status}

                                    </span>

                                  </div>

                                )}

                              </div>

                            </div>

                          );

                        })}

                      </div>

                    </div>



                    {/* Special Status Messages */}

                    {order.status === "cancelled" && (

                      <div className="px-6 pb-6">

                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">

                          <div className="flex items-center gap-2">

                            <AlertCircle className="h-5 w-5 text-red-600" />

                            <p className="text-red-800 font-medium">Order Cancelled</p>

                          </div>

                          <p className="text-red-600 text-sm mt-1">This order was cancelled and will not be processed.</p>

                        </div>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            </div>



            {/* Sidebar - Buy it again */}

            <div className="w-80 flex-shrink-0">

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">Buy it again</h2>

                <div className="space-y-4">

                  {uniqueProducts.map((product: any) => {

                    const categoryStyle = categoryColors[product.category] || { bg: "bg-slate-50", text: "text-slate-600", icon: <Package className="h-6 w-6" /> };

                    

                    return (

                      <div key={product.productId} className="flex gap-3">

                        <div className="flex-shrink-0">

                          <div className={`w-12 h-12 ${categoryStyle.bg} rounded-lg flex items-center justify-center`}>

                            <div className={`${categoryStyle.text} scale-75`}>

                              {categoryStyle.icon}

                            </div>

                          </div>

                        </div>

                        <div className="flex-1 min-w-0">

                          <h3 className="text-sm font-medium text-slate-900 truncate">{product.name}</h3>

                          <p className="text-sm text-slate-500 mt-1">Rs.{product.price.toLocaleString()}</p>

                        </div>

                        <div className="flex-shrink-0">

                          <Button size="sm" className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium">

                            Add

                          </Button>

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

