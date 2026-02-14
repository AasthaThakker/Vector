'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIRiskScoreProps {
  score: number // 0-100
  confidence: number // 0-1
  analysis: {
    match: boolean
    reason: string
    riskFactors?: string[]
    positiveFactors?: string[]
    recommendation?: string
  }
  className?: string
}

export function AIRiskScore({ score, confidence, analysis, className }: AIRiskScoreProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low Risk', color: 'emerald', icon: CheckCircle }
    if (score >= 60) return { level: 'Medium Risk', color: 'amber', icon: AlertTriangle }
    return { level: 'High Risk', color: 'rose', icon: XCircle }
  }

  const riskLevel = getRiskLevel(score)
  const Icon = riskLevel.icon

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-6 space-y-4", className)}>
      {/* Header with Risk Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            riskLevel.color === 'emerald' && "bg-emerald-100",
            riskLevel.color === 'amber' && "bg-amber-100", 
            riskLevel.color === 'rose' && "bg-rose-100"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              riskLevel.color === 'emerald' && "text-emerald-600",
              riskLevel.color === 'amber' && "text-amber-600",
              riskLevel.color === 'rose' && "text-rose-600"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">AI Risk Assessment</h3>
            <p className="text-sm text-slate-500">Confidence: {(confidence * 100).toFixed(0)}%</p>
          </div>
        </div>
        <Badge variant="outline" className={cn(
          "border-2 font-medium",
          riskLevel.color === 'emerald' && "border-emerald-200 text-emerald-700 bg-emerald-50",
          riskLevel.color === 'amber' && "border-amber-200 text-amber-700 bg-amber-50",
          riskLevel.color === 'rose' && "border-rose-200 text-rose-700 bg-rose-50"
        )}>
          {riskLevel.level}
        </Badge>
      </div>

      {/* Risk Score Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Risk Score</span>
          <span className="font-bold text-lg">{score}/100</span>
        </div>
        <Progress 
          value={score} 
          className="h-3"
          // @ts-ignore
          style={{
            '--progress-background': score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
          }}
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Safe</span>
          <span>Caution</span>
          <span>Risky</span>
        </div>
      </div>

      {/* AI Analysis Result */}
      <div className={cn(
        "p-4 rounded-lg border",
        analysis.match 
          ? "bg-emerald-50 border-emerald-200" 
          : "bg-rose-50 border-rose-200"
      )}>
        <div className="flex items-start gap-3">
          {analysis.match ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={cn(
              "font-medium text-sm",
              analysis.match ? "text-emerald-900" : "text-rose-900"
            )}>
              {analysis.match ? "Analysis Matches Description" : "Analysis Doesn't Match"}
            </p>
            <p className={cn(
              "text-sm mt-1",
              analysis.match ? "text-emerald-700" : "text-rose-700"
            )}>
              {analysis.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {analysis.riskFactors && analysis.riskFactors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            Risk Factors Identified
          </div>
          <div className="space-y-1">
            {analysis.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                {factor}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive Factors */}
      {analysis.positiveFactors && analysis.positiveFactors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Positive Indicators
          </div>
          <div className="space-y-1">
            {analysis.positiveFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {factor}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {analysis.recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-blue-900">Recommendation</p>
              <p className="text-sm text-blue-700 mt-1">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Verification Badge */}
      <div className="flex items-center justify-center pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-3 w-3" />
          <span>AI-Powered Analysis</span>
          <Eye className="h-3 w-3" />
          <span>Verified by Computer Vision</span>
        </div>
      </div>
    </div>
  )
}
