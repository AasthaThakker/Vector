/**
 * ML Prediction Service with Python Integration
 * 
 * This service uses Python pickle files for fraud detection and
 * integrates with the Node.js backend via subprocess calls.
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MLPredictionResult {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  prediction: "LEGITIMATE" | "SUSPICIOUS" | "FRAUD";
  confidence: number;
  features_used?: string[];
  error?: string;
}

export interface UserBehaviorScore {
  userId: string;
  totalReturns: number;
  approvedReturns: number;
  rejectedReturns: number;
  behaviorScore: number;
  riskLevel: "low" | "medium" | "high";
}

/**
 * Execute Python script for ML prediction
 */
async function executePythonScript(newReturn: any, historicalReturns: any[]): Promise<MLPredictionResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'return_fraud_predictor.py');
    
    // Prepare arguments
    const newReturnJson = JSON.stringify(newReturn);
    const historicalReturnsJson = JSON.stringify(historicalReturns);
    
    // Spawn Python process
    const python = spawn('python', [pythonScript, newReturnJson, historicalReturnsJson]);
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
        return;
      }
      
      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', output);
        reject(new Error(`Failed to parse Python output: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`));
      }
    });
    
    python.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(error);
    });
  });
}

/**
 * Predict fraud using Python ML model
 */
export async function predictWithPythonML(
  newReturn: any,
  historicalReturns: any[] = []
): Promise<MLPredictionResult> {
  try {
    console.log('Starting Python ML prediction for return:', newReturn._id || 'new');
    
    // Check if Python script exists
    const pythonScriptPath = path.join(process.cwd(), 'return_fraud_predictor.py');
    try {
      await fs.access(pythonScriptPath);
    } catch (accessError) {
      console.error('Python script not found:', pythonScriptPath);
      return getFallbackResult('Python script not found');
    }
    
    // Execute Python script
    const result = await executePythonScript(newReturn, historicalReturns);
    
    console.log('Python ML prediction result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Python ML prediction error:', error);
    return getFallbackResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get fallback result when Python ML fails
 */
function getFallbackResult(errorMessage: string): MLPredictionResult {
  return {
    risk_score: 0.5,
    risk_level: "MEDIUM",
    prediction: "SUSPICIOUS",
    confidence: 0.5,
    error: errorMessage
  };
}

/**
 * Update user trust score based on ML prediction
 */
export async function updateUserTrustScoreWithML(
  userId: string,
  mlResult: MLPredictionResult
): Promise<void> {
  try {
    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('@/models/User');
    
    // Calculate trust score impact based on ML result
    let trustScoreAdjustment = 0;
    
    if (mlResult.prediction === "FRAUD") {
      trustScoreAdjustment = -20; // Significant penalty for fraud prediction
    } else if (mlResult.prediction === "SUSPICIOUS") {
      trustScoreAdjustment = -10; // Moderate penalty for suspicious
    } else if (mlResult.prediction === "LEGITIMATE") {
      trustScoreAdjustment = 5; // Small reward for legitimate returns
    }
    
    // Additional adjustment based on risk score
    if (mlResult.risk_score > 0.8) {
      trustScoreAdjustment -= 10;
    } else if (mlResult.risk_score > 0.6) {
      trustScoreAdjustment -= 5;
    }
    
    // Update user's trust score
    const user = await User.findById(userId);
    if (user) {
      const newTrustScore = Math.max(0, Math.min(100, user.trustScore + trustScoreAdjustment));
      
      await User.findByIdAndUpdate(userId, {
        trustScore: newTrustScore,
        trustScoreUpdatedAt: new Date(),
        lastMLRiskScore: mlResult.risk_score,
        lastMLPrediction: mlResult.prediction,
        lastMLRiskLevel: mlResult.risk_level
      });
      
      console.log(`Updated trust score for user ${userId}: ${user.trustScore} -> ${newTrustScore} (ML: ${mlResult.prediction})`);
    }
    
  } catch (error) {
    console.error('Error updating user trust score with ML:', error);
  }
}

/**
 * Get user's historical returns for ML prediction
 */
export async function getUserHistoricalReturns(userId: string): Promise<any[]> {
  try {
    const { default: Return } = await import('@/models/Return');
    
    const returns = await Return.find({ userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance
    
    return returns.map(ret => ({
      _id: ret._id,
      price: ret.price,
      reason: ret.reason,
      description: ret.description,
      imageUrl: ret.imageUrl,
      status: ret.status,
      fraudFlag: ret.fraudFlag,
      createdAt: ret.createdAt
    }));
    
  } catch (error) {
    console.error('Error getting user historical returns:', error);
    return [];
  }
}

/**
 * Complete ML prediction and trust score update workflow
 */
export async function processReturnWithML(
  newReturn: any,
  userId: string
): Promise<{
  mlResult: MLPredictionResult;
  trustScoreUpdated: boolean;
}> {
  try {
    // Get user's historical returns
    const historicalReturns = await getUserHistoricalReturns(userId);
    
    // Run ML prediction
    const mlResult = await predictWithPythonML(newReturn, historicalReturns);
    
    // Update user trust score based on ML result
    await updateUserTrustScoreWithML(userId, mlResult);
    
    return {
      mlResult,
      trustScoreUpdated: true
    };
    
  } catch (error) {
    console.error('Error in ML processing workflow:', error);
    
    // Return fallback result
    const fallbackResult = getFallbackResult(error instanceof Error ? error.message : 'Unknown error');
    
    return {
      mlResult: fallbackResult,
      trustScoreUpdated: false
    };
  }
}

// Legacy function for backward compatibility
export async function predictWithLocalModel(
  reason: string,
  description: string,
  userHistory: any[] = []
): Promise<any> {
  // This function is kept for backward compatibility
  // New code should use predictWithPythonML
  
  const newReturn = {
    reason,
    description,
    price: 0, // Default price
    imageUrl: ''
  };
  
  const result = await predictWithPythonML(newReturn, userHistory);
  
  // Convert to old format for compatibility
  return {
    match: result.prediction === "LEGITIMATE",
    confidence: result.confidence,
    fraudScore: result.risk_score,
    riskLevel: result.risk_level.toLowerCase(),
    reason: `ML Prediction: ${result.prediction} (Risk: ${result.risk_level})`
  };
}
