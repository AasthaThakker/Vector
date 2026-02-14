"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Warehouse,
  Package,
  CheckCircle,
  ArrowRight,
  QrCode,
  ScanLine,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Shirt,
  Palette,
  Tag,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Category color mapping - Amazon/Apple inspired
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  tshirt: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  shirt: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  pants: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  jeans: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  dress: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  jacket: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  hoodie: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  sweater: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  shorts: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  skirt: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  blazer: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  coat: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  polo: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  tanktop: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  cardigan: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

const stockStatusConfig = {
  "In Stock": { 
    bg: "bg-emerald-100", 
    text: "text-emerald-800", 
    border: "border-emerald-200",
    icon: CheckCircle 
  },
  "Low Stock": { 
    bg: "bg-amber-100", 
    text: "text-amber-800", 
    border: "border-amber-200",
    icon: AlertTriangle 
  },
  "Out of Stock": { 
    bg: "bg-red-100", 
    text: "text-red-800", 
    border: "border-red-200",
    icon: AlertTriangle 
  },
};

interface InventoryItem {
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
  sku: string;
  tags: string[];
}

interface InventoryResponse {
  items: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function WarehouseDashboard() {
  const { data: returnsData, mutate } = useSWR("/api/returns?all=true", fetcher);
  const { data: inventoryData, mutate: mutateInv } = useSWR<InventoryResponse>("/api/inventory?limit=20", fetcher);
  const [scanInput, setScanInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    const stockStatus = item.stock === 0 ? "Out of Stock" : item.stock <= item.minStock ? "Low Stock" : "In Stock";
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "in-stock" && stockStatus === "In Stock") ||
      (selectedStatus === "low-stock" && stockStatus === "Low Stock") ||
      (selectedStatus === "out-of-stock" && stockStatus === "Out of Stock");
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= minStock) return "Low Stock";
    return "In Stock";
  };

  // Get unique categories from inventory
  const categories = [...new Set(inventory.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Warehouse Dashboard
              </h1>
              <p className="text-slate-500 text-sm">
                Manage returns, inventory, and quality control
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Apple/Amazon Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* In Transit Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  +12% today
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{inTransit.length}</p>
              <p className="text-sm text-slate-500">In Transit</p>
            </div>
          </div>

          {/* Received Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Warehouse className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{warehouseReceived.length}</p>
              <p className="text-sm text-slate-500">Received Today</p>
            </div>
          </div>

          {/* Awaiting Pickup Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-teal-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{approvedForPickup.length}</p>
              <p className="text-sm text-slate-500">Awaiting Pickup</p>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-green-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {inventoryData?.pagination?.total?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-500">Total Inventory</p>
            </div>
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Quick Scan</h2>
              <p className="text-sm text-slate-500">Scan return ID to mark as received</p>
            </div>
            <div className="flex gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <ScanLine className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter return ID..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <Button 
                onClick={handleScan} 
                disabled={!scanInput}
                className="px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                Receive
              </Button>
            </div>
          </div>
        </div>

        {/* Returns Management Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* In Transit */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">In Transit</h3>
                </div>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  {inTransit.length} items
                </Badge>
              </div>
            </div>
            <div className="p-5">
              {inTransit.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No items in transit</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inTransit.slice(0, 5).map((ret: any) => (
                    <div
                      key={ret._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{ret.reason}</p>
                        <p className="text-sm text-slate-500">ID: {ret._id.slice(-8)} • Price: ₹{ret.price?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ret.status} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReceive(ret._id)}
                          className="border-amber-200 hover:bg-amber-50"
                        >
                          Receive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QC Queue */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">QC Inspection</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {warehouseReceived.length} pending
                </Badge>
              </div>
            </div>
            <div className="p-5">
              {warehouseReceived.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No items awaiting QC</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {warehouseReceived.slice(0, 5).map((ret: any) => (
                    <div
                      key={ret._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{ret.reason}</p>
                        <p className="text-sm text-slate-500">ID: {ret._id.slice(-8)} • Price: ₹{ret.price?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQC(ret._id, true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fashion Inventory Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Fashion Inventory</h2>
                  <p className="text-sm text-slate-500">
                    {filteredInventory.length} of {inventoryData?.pagination?.total || 0} items
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search products, brands, SKUs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Size/Color
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No inventory items found</p>
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, index) => {
                    const stockStatus = getStockStatus(item.stock, item.minStock);
                    const statusConfig = stockStatusConfig[stockStatus as keyof typeof stockStatusConfig];
                    const StatusIcon = statusConfig.icon;
                    const categoryStyle = categoryColors[item.category] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };

                    return (
                      <tr 
                        key={item._id} 
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${categoryStyle.bg} ${categoryStyle.border} border flex items-center justify-center shadow-sm`}>
                              <Shirt className={`h-6 w-6 ${categoryStyle.text}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                                {item.productName}
                              </p>
                              <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                {item.sku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{item.brand}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-slate-900">{item.size}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-600">{item.color}</span>
                            </div>
                            <p className="text-xs text-slate-500">{item.material} · {item.season}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">Rs.{item.price.toLocaleString()}</p>
                            {item.salePrice && (
                              <p className="text-sm text-emerald-600 font-medium">
                                Sale: Rs.{item.salePrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-lg font-bold ${
                              item.stock === 0 ? "text-red-600" : 
                              item.stock <= item.minStock ? "text-amber-600" : "text-emerald-600"
                            }`}>
                              {item.stock}
                            </span>
                            <span className="text-xs text-slate-400">Min: {item.minStock}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {stockStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {inventoryData && inventoryData.pagination && inventoryData.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {((inventoryData.pagination.page - 1) * inventoryData.pagination.limit) + 1} to{' '}
                  {Math.min(inventoryData.pagination.page * inventoryData.pagination.limit, inventoryData.pagination.total)} of{' '}
                  {inventoryData.pagination.total.toLocaleString()} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-200 hover:bg-slate-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 px-3">
                    Page {currentPage} of {inventoryData.pagination?.pages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(inventoryData.pagination?.pages || 1, prev + 1))}
                    disabled={currentPage === (inventoryData.pagination?.pages || 1)}
                    className="border-slate-200 hover:bg-slate-100"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
