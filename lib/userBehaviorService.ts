import { connectDB } from './mongodb';
import Return from '@/models/Return';
import mongoose from 'mongoose';

export interface UserBehaviorScore {
  userId: string;
  returnHistoryCount: number;
  approvalRate: number;
  fraudFlagRate: number;
  reasonConsistencyScore: number;
  averageConfidenceScore: number;
  behaviorScore: number; // 0-100, higher is better
  riskLevel: 'low' | 'medium' | 'high';
}

export class UserBehaviorService {
  /**
   * Calculate user behavior score based on historical return data
   */
  static async calculateUserBehaviorScore(userId: string): Promise<UserBehaviorScore> {
    try {
      await connectDB();
      
      // Get user's return history
      const userReturns = await Return.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50); // Analyze last 50 returns

      if (userReturns.length === 0) {
        // New user gets neutral score
        return {
          userId,
          returnHistoryCount: 0,
          approvalRate: 0.85, // Assume good for new users
          fraudFlagRate: 0,
          reasonConsistencyScore: 0.8,
          averageConfidenceScore: 0.8,
          behaviorScore: 75,
          riskLevel: 'medium'
        };
      }

      // Calculate metrics
      const totalReturns = userReturns.length;
      const approvedReturns = userReturns.filter(r => r.status === 'approved' || r.status === 'completed').length;
      const fraudFlaggedReturns = userReturns.filter(r => r.fraudFlag).length;
      
      // Calculate approval rate
      const approvalRate = approvedReturns / totalReturns;
      
      // Calculate fraud flag rate
      const fraudFlagRate = fraudFlaggedReturns / totalReturns;
      
      // Calculate reason consistency (how often AI analysis matches the reason)
      const returnsWithAI = userReturns.filter(r => r.aiAnalysisResult);
      let reasonConsistencyScore = 0.8; // Default
      
      if (returnsWithAI.length > 0) {
        const consistentReturns = returnsWithAI.filter(r => r.aiAnalysisResult?.match).length;
        reasonConsistencyScore = consistentReturns / returnsWithAI.length;
      }
      
      // Calculate average AI confidence
      let averageConfidenceScore = 0.8; // Default
      if (returnsWithAI.length > 0) {
        const totalConfidence = returnsWithAI.reduce((sum, r) => sum + (r.aiAnalysisResult?.confidence || 0), 0);
        averageConfidenceScore = totalConfidence / returnsWithAI.length;
      }
      
      // Calculate overall behavior score (0-100)
      let behaviorScore = 50; // Base score
      
      // Approval rate impact (+/- 25 points)
      behaviorScore += (approvalRate - 0.5) * 50;
      
      // Fraud flag impact (-30 points max)
      behaviorScore -= fraudFlagRate * 60;
      
      // Reason consistency impact (+/- 15 points)
      behaviorScore += (reasonConsistencyScore - 0.5) * 30;
      
      // AI confidence impact (+/- 10 points)
      behaviorScore += (averageConfidenceScore - 0.5) * 20;
      
      // Ensure score is within bounds
      behaviorScore = Math.max(0, Math.min(100, behaviorScore));
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high';
      if (behaviorScore >= 75) {
        riskLevel = 'low';
      } else if (behaviorScore >= 50) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'high';
      }
      
      return {
        userId,
        returnHistoryCount: totalReturns,
        approvalRate,
        fraudFlagRate,
        reasonConsistencyScore,
        averageConfidenceScore,
        behaviorScore,
        riskLevel
      };
      
    } catch (error) {
      console.error('Error calculating user behavior score:', error);
      // Return conservative default on error
      return {
        userId,
        returnHistoryCount: 0,
        approvalRate: 0.7,
        fraudFlagRate: 0.1,
        reasonConsistencyScore: 0.6,
        averageConfidenceScore: 0.6,
        behaviorScore: 50,
        riskLevel: 'medium'
      };
    }
  }
  
  /**
   * Get behavior-based confidence adjustment
   */
  static getConfidenceAdjustment(behaviorScore: UserBehaviorScore): number {
    // Adjust AI confidence based on user behavior
    // Good users get confidence boost, risky users get penalty
    const { behaviorScore: score, riskLevel } = behaviorScore;
    
    switch (riskLevel) {
      case 'low':
        return 1.15; // 15% boost
      case 'medium':
        return 1.0;  // No adjustment
      case 'high':
        return 0.85; // 15% penalty
      default:
        return 1.0;
    }
  }
  
  /**
   * Get behavior-based threshold adjustment
   */
  static getThresholdAdjustment(behaviorScore: UserBehaviorScore): number {
    // Adjust validation threshold based on user behavior
    // Good users get lower threshold (easier approval), risky users get higher threshold
    const { riskLevel } = behaviorScore;
    
    switch (riskLevel) {
      case 'low':
        return 0.20; // Lower threshold
      case 'medium':
        return 0.30; // Standard threshold
      case 'high':
        return 0.40; // Higher threshold
      default:
        return 0.30;
    }
  }
}
