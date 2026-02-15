'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  CheckCircle, 
  Clock,
  Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderStatusTimelineProps {
  orders: any[]
  className?: string
}

interface StatusStep {
  key: string
  label: string
  icon: React.ElementType
  color: string
  description: string
}

const orderStatusFlow: StatusStep[] = [
  { 
    key: "pending", 
    label: "Order Placed", 
    icon: Package, 
    color: "blue", 
    description: "Your order has been received" 
  },
  { 
    key: "processing", 
    label: "Processing", 
    icon: Clock, 
    color: "amber", 
    description: "Your order is being prepared" 
  },
  { 
    key: "shipped", 
    label: "Shipped", 
    icon: Truck, 
    color: "purple", 
    description: "Your order is on the way" 
  },
  { 
    key: "delivered", 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "emerald", 
    description: "Your order has been delivered" 
  }
]

const colorMap: Record<string, { bg: string; text: string; border: string; line: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", line: "bg-blue-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", line: "bg-amber-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", line: "bg-purple-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", line: "bg-emerald-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", line: "bg-rose-500" }
}

export function OrderStatusTimeline({ orders, className }: OrderStatusTimelineProps) {
  // Calculate status counts
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalOrders = orders.length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {orderStatusFlow.map((status) => {
          const count = statusCounts[status.key] || 0
          const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
          const colors = colorMap[status.color]
          const Icon = status.icon

          return (
            <Card key={status.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <Icon className={cn("h-5 w-5", colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600">{status.label}</p>
                    <p className="text-xl font-bold text-slate-900">{count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="mt-3 h-1"
                  // @ts-ignore
                  style={{ '--progress-background': colors.line.replace('bg-', '#').replace('500', '600') }}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status Distribution Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {orderStatusFlow.map((status) => {
              const count = statusCounts[status.key] || 0
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
              const colors = colorMap[status.color]

              return (
                <div key={status.key} className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <status.icon className={cn("h-4 w-4", colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{status.label}</span>
                      <span className="text-sm text-slate-600">{count} orders</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      // @ts-ignore
                      style={{ '--progress-background': colors.line.replace('bg-', '#').replace('500', '600') }}
                    />
                  </div>
                  <div className="text-sm font-medium text-slate-700 min-w-12 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
