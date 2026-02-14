'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertTriangle, 
  Package,
  Shirt,
  Zap,
  Wrench,
  HeartCrack,
  Scissors
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReturnReasonVisualizationProps {
  returns: any[]
  className?: string
}

export function ReturnReasonVisualization({ returns, className }: ReturnReasonVisualizationProps) {
  // Analyze return reasons
  const reasonCounts = returns.reduce((acc, returnItem) => {
    const reason = returnItem.reason || 'unknown'
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalReturns = returns.length

  // Define reason metadata
  const reasonMetadata: Record<string, {
    label: string
    icon: React.ElementType
    color: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }> = {
    wrong_size: {
      label: 'Wrong Size',
      icon: Shirt,
      color: 'blue',
      description: 'Item doesn\'t fit correctly',
      severity: 'low'
    },
    defective: {
      label: 'Defective Item',
      icon: Wrench,
      color: 'rose',
      description: 'Product has manufacturing defects',
      severity: 'high'
    },
    wrong_item: {
      label: 'Wrong Item',
      icon: Package,
      color: 'amber',
      description: 'Received different product than ordered',
      severity: 'medium'
    },
    quality_issue: {
      label: 'Quality Issue',
      icon: AlertTriangle,
      color: 'orange',
      description: 'Poor material or workmanship',
      severity: 'medium'
    },
    not_as_described: {
      label: 'Not as Described',
      icon: Scissors,
      color: 'purple',
      description: 'Product differs from description',
      severity: 'medium'
    },
    changed_mind: {
      label: 'Changed Mind',
      icon: HeartCrack,
      color: 'slate',
      description: 'Customer no longer wants the item',
      severity: 'low'
    },
    damaged_shipping: {
      label: 'Damaged in Shipping',
      icon: Zap,
      color: 'red',
      description: 'Item damaged during delivery',
      severity: 'high'
    }
  }

  // Process reasons with metadata
  const processedReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      key: reason,
      count,
      percentage: totalReturns > 0 ? (count / totalReturns) * 100 : 0,
      metadata: reasonMetadata[reason] || {
        label: reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: AlertTriangle,
        color: 'slate',
        description: 'Other reason',
        severity: 'medium' as const
      }
    }))
    .sort((a, b) => b.count - a.count)

  // Calculate severity distribution
  const severityCounts = processedReasons.reduce((acc, reason) => {
    acc[reason.metadata.severity] = (acc[reason.metadata.severity] || 0) + reason.count
    return acc
  }, {} as Record<string, number>)

  const severityColors = {
    low: 'emerald',
    medium: 'amber', 
    high: 'rose'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <PieChartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Returns</p>
                <p className="text-2xl font-bold text-slate-900">{totalReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Most Common</p>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {processedReasons[0]?.metadata.label || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">High Severity</p>
                <p className="text-2xl font-bold text-slate-900">{severityCounts.high || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Return Reasons Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Return Reasons Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {processedReasons.map((reason) => {
            const Icon = reason.metadata.icon
            const severityColor = severityColors[reason.metadata.severity]
            
            return (
              <div key={reason.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      reason.metadata.color === 'blue' && "bg-blue-100",
                      reason.metadata.color === 'rose' && "bg-rose-100",
                      reason.metadata.color === 'amber' && "bg-amber-100",
                      reason.metadata.color === 'purple' && "bg-purple-100",
                      reason.metadata.color === 'orange' && "bg-orange-100",
                      reason.metadata.color === 'red' && "bg-red-100",
                      reason.metadata.color === 'slate' && "bg-slate-100"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        reason.metadata.color === 'blue' && "text-blue-600",
                        reason.metadata.color === 'rose' && "text-rose-600",
                        reason.metadata.color === 'amber' && "text-amber-600",
                        reason.metadata.color === 'purple' && "text-purple-600",
                        reason.metadata.color === 'orange' && "text-orange-600",
                        reason.metadata.color === 'red' && "text-red-600",
                        reason.metadata.color === 'slate' && "text-slate-600"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{reason.metadata.label}</p>
                      <p className="text-sm text-slate-500">{reason.metadata.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{reason.count}</p>
                    <p className="text-sm text-slate-500">{reason.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={reason.percentage} 
                    className="h-2"
                    // @ts-ignore
                    style={{
                      '--progress-background': 
                        reason.metadata.color === 'blue' ? '#3b82f6' :
                        reason.metadata.color === 'rose' ? '#ef4444' :
                        reason.metadata.color === 'amber' ? '#f59e0b' :
                        reason.metadata.color === 'purple' ? '#a855f7' :
                        reason.metadata.color === 'orange' ? '#f97316' :
                        reason.metadata.color === 'red' ? '#dc2626' :
                        reason.metadata.color === 'slate' ? '#64748b' : '#64748b'
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        severityColor === 'emerald' && "border-emerald-200 text-emerald-700 bg-emerald-50",
                        severityColor === 'amber' && "border-amber-200 text-amber-700 bg-amber-50",
                        severityColor === 'rose' && "border-rose-200 text-rose-700 bg-rose-50"
                      )}
                    >
                      {reason.metadata.severity} severity
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {((reason.count / totalReturns) * 100).toFixed(1)}% of all returns
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(severityCounts).map(([severity, count]) => {
            const percentage = totalReturns > 0 ? (count / totalReturns) * 100 : 0
            const color = severityColors[severity as keyof typeof severityColors]
            
            return (
              <div key={severity} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      color === 'emerald' && "bg-emerald-500",
                      color === 'amber' && "bg-amber-500",
                      color === 'rose' && "bg-rose-500"
                    )} />
                    <span className="capitalize font-medium">{severity} Severity</span>
                  </div>
                  <span className="text-sm text-slate-600">{count} returns ({percentage.toFixed(1)}%)</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  // @ts-ignore
                  style={{
                    '--progress-background': 
                      color === 'emerald' ? '#10b981' :
                      color === 'amber' ? '#f59e0b' :
                      color === 'rose' ? '#ef4444' : '#64748b'
                  }}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
