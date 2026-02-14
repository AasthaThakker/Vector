'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Eye, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  Target,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAnalysisExplanationProps {
  analysis: {
    match: boolean
    reason: string
    confidence: number
    riskScore?: number
    details?: {
      imageAnalysis?: string
      textAnalysis?: string
      comparison?: string
      recommendations?: string[]
    }
  }
  imageUrl?: string
  className?: string
}

export function AIAnalysisExplanation({ analysis, imageUrl, className }: AIAnalysisExplanationProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: 'Very High', color: 'emerald' }
    if (confidence >= 0.7) return { level: 'High', color: 'blue' }
    if (confidence >= 0.5) return { level: 'Medium', color: 'amber' }
    return { level: 'Low', color: 'rose' }
  }

  const confidenceLevel = getConfidenceLevel(analysis.confidence)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main AI Analysis Card */}
      <Card className="border-2 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                AI Analysis
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className={cn(
                "font-medium",
                confidenceLevel.color === 'emerald' && "border-emerald-200 text-emerald-700 bg-emerald-50",
                confidenceLevel.color === 'blue' && "border-blue-200 text-blue-700 bg-blue-50",
                confidenceLevel.color === 'amber' && "border-amber-200 text-amber-700 bg-amber-50",
                confidenceLevel.color === 'rose' && "border-rose-200 text-rose-700 bg-rose-50"
              )}>
                {confidenceLevel.level} Confidence
              </Badge>
              <Badge variant="secondary">
                {(analysis.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Result Status */}
          <div className={cn(
            "p-4 rounded-lg border-2",
            analysis.match 
              ? "bg-emerald-50 border-emerald-200" 
              : "bg-rose-50 border-rose-200"
          )}>
            <div className="flex items-start gap-3">
              {analysis.match ? (
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={cn(
                  "font-bold text-lg mb-2",
                  analysis.match ? "text-emerald-900" : "text-rose-900"
                )}>
                  {analysis.match ? "✓ Description Matches Image" : "✗ Description Doesn't Match"}
                </h3>
                <p className={cn(
                  "text-sm leading-relaxed",
                  analysis.match ? "text-emerald-700" : "text-rose-700"
                )}>
                  {analysis.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          {analysis.riskScore !== undefined && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-600" />
                  <span className="font-medium text-slate-700">Risk Assessment</span>
                </div>
                <span className="font-bold text-lg">{analysis.riskScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    analysis.riskScore >= 80 ? "bg-emerald-500" :
                    analysis.riskScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${analysis.riskScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Expandable Details */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between h-auto p-4 bg-slate-50 hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="font-medium">View Detailed Analysis</span>
              </div>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showDetails && analysis.details && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Image Analysis */}
                {analysis.details.imageAnalysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Image Analysis</h4>
                    </div>
                    <p className="text-sm text-blue-700">{analysis.details.imageAnalysis}</p>
                  </div>
                )}

                {/* Text Analysis */}
                {analysis.details.textAnalysis && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-purple-900">Text Analysis</h4>
                    </div>
                    <p className="text-sm text-purple-700">{analysis.details.textAnalysis}</p>
                  </div>
                )}

                {/* Comparison */}
                {analysis.details.comparison && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-amber-600" />
                      <h4 className="font-medium text-amber-900">Comparison Analysis</h4>
                    </div>
                    <p className="text-sm text-amber-700">{analysis.details.comparison}</p>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.details.recommendations && analysis.details.recommendations.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-medium text-emerald-900">Recommendations</h4>
                    </div>
                    <div className="space-y-2">
                      {analysis.details.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <p className="text-sm text-emerald-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Verification Footer */}
          <div className="flex items-center justify-center pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                <span>Powered by Computer Vision</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>Advanced AI Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Real-time Processing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side comparison if image is available */}
      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Submitted Image</h4>
                <div className="relative rounded-lg overflow-hidden border border-slate-200">
                  <img 
                    src={imageUrl} 
                    alt="Submitted return image" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Original
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">AI Analysis Result</h4>
                <div className={cn(
                  "rounded-lg border-2 border-dashed h-48 flex items-center justify-center",
                  analysis.match 
                    ? "border-emerald-300 bg-emerald-50" 
                    : "border-rose-300 bg-rose-50"
                )}>
                  <div className="text-center">
                    {analysis.match ? (
                      <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                    ) : (
                      <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-2" />
                    )}
                    <p className={cn(
                      "font-medium text-sm",
                      analysis.match ? "text-emerald-700" : "text-rose-700"
                    )}>
                      {analysis.match ? "Verified" : "Flagged"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(analysis.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
