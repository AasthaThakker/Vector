/**
 * Trust Score Calculation Service
 * 
 * This service calculates dynamic trust scores for users based on:
 * - Average price of return orders
 * - Frequency of return orders
 * - Time patterns (return frequency over time)
 * - Return success/failure rates
 * - Account age
 */

import Return from '@/models/Return';
import Order from '@/models/Order';
import User from '@/models/User';

export interface TrustScoreFactors {
  averageReturnPrice: number;
  returnFrequency: number;
  returnRate: number;
  accountAge: number;
  successRate: number;
  timePatternScore: number;
  fraudFlagCount: number;
}

export interface TrustScoreBreakdown {
  currentScore: number;
  previousScore: number;
  factors: TrustScoreFactors;
  breakdown: {
    priceImpact: number;
    frequencyImpact: number;
    timingImpact: number;
    successImpact: number;
    accountAgeImpact: number;
    fraudImpact: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

/**
 * Calculate trust score based on multiple factors
 */
export async function calculateTrustScore(userId: string): Promise<TrustScoreBreakdown> {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's returns
    const returns = await Return.find({ userId })
      .sort({ createdAt: -1 })
      .populate('orderId');

    // Get user's orders
    const orders = await Order.find({ userId });

    // Calculate factors
    const factors = await calculateTrustFactors(userId, returns, orders);
    
    // Calculate impacts
    const breakdown = calculateScoreImpacts(factors, user.createdAt);
    
    // Calculate final score
    const baseScore = 100;
    let finalScore = baseScore;
    
    finalScore += breakdown.priceImpact;
    finalScore += breakdown.frequencyImpact;
    finalScore += breakdown.timingImpact;
    finalScore += breakdown.successImpact;
    finalScore += breakdown.accountAgeImpact;
    finalScore += breakdown.fraudImpact;
    
    // Ensure score is within bounds
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (finalScore < 40) {
      riskLevel = 'high';
    } else if (finalScore < 70) {
      riskLevel = 'medium';
    }
    
    // Generate recommendations
    const recommendations = generateRecommendations(finalScore, factors);
    
    return {
      currentScore: Math.round(finalScore),
      previousScore: user.trustScore || 100,
      factors,
      breakdown,
      riskLevel,
      recommendations
    };
    
  } catch (error) {
    console.error('Error calculating trust score:', error);
    throw error;
  }
}

/**
 * Calculate individual trust factors
 */
async function calculateTrustFactors(
  userId: string, 
  returns: any[], 
  orders: any[]
): Promise<TrustScoreFactors> {
  // Average return price
  const totalReturnPrice = returns.reduce((sum, ret) => sum + (ret.price || 0), 0);
  const averageReturnPrice = returns.length > 0 ? totalReturnPrice / returns.length : 0;
  
  // Return frequency (returns per month)
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  const recentReturns = returns.filter(ret => new Date(ret.createdAt) > threeMonthsAgo);
  const returnFrequency = recentReturns.length / 3; // returns per month
  
  // Return rate (returns vs orders)
  const returnRate = orders.length > 0 ? returns.length / orders.length : 0;
  
  // Account age (in months)
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const accountAge = (now.getTime() - user.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000);
  
  // Success rate (approved returns vs total returns)
  const approvedReturns = returns.filter(ret => ret.status === 'approved').length;
  const successRate = returns.length > 0 ? approvedReturns / returns.length : 1;
  
  // Time pattern score (based on clustering of returns)
  const timePatternScore = calculateTimePatternScore(returns);
  
  // Fraud flag count
  const fraudFlagCount = returns.filter(ret => ret.fraudFlag === true).length;
  
  return {
    averageReturnPrice,
    returnFrequency,
    returnRate,
    accountAge,
    successRate,
    timePatternScore,
    fraudFlagCount
  };
}

/**
 * Calculate time pattern score based on return clustering
 */
function calculateTimePatternScore(returns: any[]): number {
  if (returns.length < 2) return 1; // No pattern with single return
  
  // Sort returns by date
  const sortedReturns = returns.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Calculate time gaps between consecutive returns
  const timeGaps: number[] = [];
  for (let i = 1; i < sortedReturns.length; i++) {
    const gap = (new Date(sortedReturns[i].createdAt).getTime() - 
                 new Date(sortedReturns[i-1].createdAt).getTime()) / (24 * 60 * 60 * 1000);
    timeGaps.push(gap);
  }
  
  // Calculate average gap
  const avgGap = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
  
  // Penalize if returns are clustered (small gaps)
  if (avgGap < 7) return 0.3; // Very clustered
  if (avgGap < 14) return 0.6; // Moderately clustered
  if (avgGap < 30) return 0.8; // Slightly clustered
  return 1; // Well spaced
}

/**
 * Calculate score impacts for each factor
 */
function calculateScoreImpacts(factors: TrustScoreFactors, accountCreatedAt: Date): any {
  let priceImpact = 0;
  let frequencyImpact = 0;
  let timingImpact = 0;
  let successImpact = 0;
  let accountAgeImpact = 0;
  let fraudImpact = 0;
  
  // Price impact (high average return price is negative)
  if (factors.averageReturnPrice > 100) priceImpact -= 15;
  else if (factors.averageReturnPrice > 50) priceImpact -= 8;
  else if (factors.averageReturnPrice > 25) priceImpact -= 3;
  
  // Frequency impact (high return frequency is negative)
  if (factors.returnFrequency > 2) frequencyImpact -= 20;
  else if (factors.returnFrequency > 1) frequencyImpact -= 10;
  else if (factors.returnFrequency > 0.5) frequencyImpact -= 5;
  
  // Return rate impact (high return rate vs orders is negative)
  if (factors.returnRate > 0.5) frequencyImpact -= 15;
  else if (factors.returnRate > 0.3) frequencyImpact -= 8;
  else if (factors.returnRate > 0.2) frequencyImpact -= 3;
  
  // Timing impact (poor time patterns are negative)
  timingImpact = (factors.timePatternScore - 1) * 20;
  
  // Success impact (high success rate is positive)
  if (factors.successRate > 0.9) successImpact += 10;
  else if (factors.successRate > 0.8) successImpact += 5;
  else if (factors.successRate < 0.5) successImpact -= 15;
  else if (factors.successRate < 0.7) successImpact -= 8;
  
  // Account age impact (older accounts are positive)
  if (factors.accountAge > 12) accountAgeImpact += 10;
  else if (factors.accountAge > 6) accountAgeImpact += 5;
  else if (factors.accountAge < 1) accountAgeImpact -= 10;
  
  // Fraud impact (any fraud flags are very negative)
  fraudImpact = factors.fraudFlagCount * -25;
  
  return {
    priceImpact,
    frequencyImpact,
    timingImpact,
    successImpact,
    accountAgeImpact,
    fraudImpact
  };
}

/**
 * Generate recommendations based on trust score and factors
 */
function generateRecommendations(score: number, factors: TrustScoreFactors): string[] {
  const recommendations: string[] = [];
  
  if (score < 40) {
    recommendations.push('High risk user - consider manual review for all returns');
    recommendations.push('Limit return frequency or require additional verification');
  }
  
  if (factors.returnFrequency > 1) {
    recommendations.push('Return frequency is high - monitor closely');
  }
  
  if (factors.averageReturnPrice > 50) {
    recommendations.push('High-value returns detected - verify product condition');
  }
  
  if (factors.successRate < 0.7) {
    recommendations.push('Low return success rate - review return reasons');
  }
  
  if (factors.fraudFlagCount > 0) {
    recommendations.push('Previous fraud flags detected - enhanced verification required');
  }
  
  if (factors.timePatternScore < 0.5) {
    recommendations.push('Returns are clustered - potential abuse pattern');
  }
  
  if (score > 80) {
    recommendations.push('Excellent trust score - can process returns automatically');
  }
  
  return recommendations;
}

/**
 * Update user trust score in database
 */
export async function updateUserTrustScore(userId: string): Promise<TrustScoreBreakdown> {
  try {
    const scoreBreakdown = await calculateTrustScore(userId);
    
    // Update user document
    await User.findByIdAndUpdate(userId, {
      trustScore: scoreBreakdown.currentScore,
      trustScoreUpdatedAt: new Date(),
      trustFactors: scoreBreakdown.factors,
      riskLevel: scoreBreakdown.riskLevel
    });
    
    // Log the score update
    console.log(`Trust score updated for user ${userId}: ${scoreBreakdown.previousScore} -> ${scoreBreakdown.currentScore}`);
    
    return scoreBreakdown;
    
  } catch (error) {
    console.error('Error updating user trust score:', error);
    throw error;
  }
}

/**
 * Batch update trust scores for all users
 */
export async function batchUpdateTrustScores(): Promise<{ updated: number; errors: string[] }> {
  try {
    const users = await User.find({});
    const errors: string[] = [];
    let updated = 0;
    
    for (const user of users) {
      try {
        await updateUserTrustScore(user._id.toString());
        updated++;
      } catch (error) {
        errors.push(`Failed to update user ${user._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return { updated, errors };
    
  } catch (error) {
    console.error('Error in batch trust score update:', error);
    throw error;
  }
}
