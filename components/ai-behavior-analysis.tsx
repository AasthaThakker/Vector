import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserBehaviorScore } from '@/lib/userBehaviorService';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User
} from 'lucide-react';

interface AIBehaviorAnalysisProps {
  confidence?: number;
  adjustedConfidence?: number;
  behaviorAdjustedThreshold?: number;
  behaviorScore?: UserBehaviorScore;
  match?: boolean;
  reason?: string;
}

export default function AIBehaviorAnalysis({
  confidence,
  adjustedConfidence,
  behaviorAdjustedThreshold,
  behaviorScore,
  match,
  reason
}: AIBehaviorAnalysisProps) {
  if (!behaviorScore && !confidence) {
    return null;
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.6) return 'bg-yellow-500';
    if (conf >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* AI Analysis Result */}
      {confidence !== undefined && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {match ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              AI Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Match Status:</span>
              <Badge variant={match ? "default" : "destructive"}>
                {match ? "Matches" : "Does Not Match"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Confidence:</span>
                <span className="font-medium">{(confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={confidence * 100} 
                className="h-2"
              />
            </div>

            {adjustedConfidence !== undefined && adjustedConfidence !== confidence && (
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Behavior-Adjusted Confidence:</span>
                  <span className="font-medium text-blue-700">
                    {(adjustedConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={adjustedConfidence * 100} 
                  className="h-2"
                />
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  {adjustedConfidence > confidence ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {adjustedConfidence > confidence ? 'Boosted' : 'Reduced'} by user behavior
                  </span>
                </div>
              </div>
            )}

            {behaviorAdjustedThreshold && (
              <div className="text-xs text-gray-600">
                Validation Threshold: {(behaviorAdjustedThreshold * 100).toFixed(0)}%
              </div>
            )}

            {reason && (
              <div className="text-sm">
                <span className="font-medium">Reason: </span>
                <span className="text-gray-600">{reason}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Behavior Score */}
      {behaviorScore && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              User Behavior Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge className={getRiskColor(behaviorScore.riskLevel)}>
                <div className="flex items-center gap-1">
                  {getRiskIcon(behaviorScore.riskLevel)}
                  <span className="capitalize">{behaviorScore.riskLevel}</span>
                </div>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Behavior Score:</span>
                <span className="font-medium">{behaviorScore.behaviorScore.toFixed(0)}/100</span>
              </div>
              <Progress 
                value={behaviorScore.behaviorScore} 
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Return History:</span>
                <div className="font-medium">{behaviorScore.returnHistoryCount} returns</div>
              </div>
              <div>
                <span className="text-gray-600">Approval Rate:</span>
                <div className="font-medium">{(behaviorScore.approvalRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-gray-600">Reason Consistency:</span>
                <div className="font-medium">{(behaviorScore.reasonConsistencyScore * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-gray-600">Avg AI Confidence:</span>
                <div className="font-medium">{(behaviorScore.averageConfidenceScore * 100).toFixed(1)}%</div>
              </div>
            </div>

            {behaviorScore.fraudFlagRate > 0 && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                Fraud Flag Rate: {(behaviorScore.fraudFlagRate * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
