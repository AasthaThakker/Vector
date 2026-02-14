'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Users, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderAnalyticsProps {
  orders: any[]
  className?: string
}

export function OrderAnalytics({ orders, className }: OrderAnalyticsProps) {
  // Calculate analytics
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const deliveredOrders = statusCounts.delivered || 0
  const processingOrders = statusCounts.processing || 0
  const shippedOrders = statusCounts.shipped || 0
  const cancelledOrders = statusCounts.cancelled || 0
  
  const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
  
  // Calculate top products
  const productCounts = orders.reduce((acc, order) => {
    order.products?.forEach((product: any) => {
      acc[product.name] = (acc[product.name] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  
  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    color 
  }: {
    title: string
    value: string | number
    change?: number
    changeType?: 'increase' | 'decrease'
    icon: React.ElementType
    color: string
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {changeType === 'increase' ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-rose-500" />
                )}
                <span className={cn(
                  "font-medium",
                  changeType === 'increase' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {change}%
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            color === 'blue' && "bg-blue-100",
            color === 'emerald' && "bg-emerald-100",
            color === 'amber' && "bg-amber-100",
            color === 'rose' && "bg-rose-100"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              color === 'blue' && "text-blue-600",
              color === 'emerald' && "text-emerald-600",
              color === 'amber' && "text-amber-600",
              color === 'rose' && "text-rose-600"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          change={12}
          changeType="increase"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={8}
          changeType="increase"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Math.round(averageOrderValue).toLocaleString()}`}
          change={-3}
          changeType="decrease"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Delivery Rate"
          value={`${deliveryRate.toFixed(1)}%`}
          change={5}
          changeType="increase"
          icon={Activity}
          color="rose"
        />
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
              const statusColors = {
                delivered: 'emerald',
                processing: 'blue', 
                shipped: 'amber',
                cancelled: 'rose'
              }
              const color = statusColors[status as keyof typeof statusColors] || 'slate'
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{status}</span>
                    <span className="text-slate-600">{count} orders ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    // @ts-ignore
                    style={{
                      '--progress-background': 
                        color === 'emerald' ? '#10b981' :
                        color === 'blue' ? '#3b82f6' :
                        color === 'amber' ? '#f59e0b' :
                        color === 'rose' ? '#ef4444' : '#64748b'
                    }}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white",
                      index === 0 && "bg-gradient-to-r from-yellow-400 to-yellow-600",
                      index === 1 && "bg-gradient-to-r from-gray-300 to-gray-500", 
                      index === 2 && "bg-gradient-to-r from-amber-600 to-amber-800",
                      index >= 3 && "bg-slate-400"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.count} orders</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {((product.count / totalOrders) * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Order Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order, index) => (
              <div key={order._id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  order.status === 'delivered' && "bg-emerald-500",
                  order.status === 'processing' && "bg-blue-500",
                  order.status === 'shipped' && "bg-amber-500",
                  order.status === 'cancelled' && "bg-rose-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.products?.length || 0} items • ₹{order.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize text-xs">
                    {order.status}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
