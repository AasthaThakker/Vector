#!/usr/bin/env python3
"""
Return Fraud Detection ML Model
Uses pickle files to predict return fraud risk
"""

import pickle
import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List

class ReturnFraudPredictor:
    def __init__(self):
        """Initialize the model with pickle files"""
        try:
            # Load the ML model, scaler, and feature columns
            with open('return_fraud_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            
            with open('return_scaler.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open('feature_columns.pkl', 'rb') as f:
                self.feature_columns = pickle.load(f)
            
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def extract_features(self, new_return: Dict[str, Any], historical_returns: List[Dict[str, Any]]) -> pd.DataFrame:
        """Extract features from new return and historical data"""
        
        # Basic features from new return
        features = {
            'return_amount': new_return.get('price', 0),
            'return_reason_encoded': self._encode_reason(new_return.get('reason', '')),
            'description_length': len(new_return.get('description', '')),
            'has_image': 1 if new_return.get('imageUrl', '') else 0,
        }
        
        # Historical features
        if historical_returns:
            returns_df = pd.DataFrame(historical_returns)
            
            # User return history features
            features['total_returns'] = len(historical_returns)
            features['approved_returns'] = len(returns_df[returns_df['status'] == 'approved'])
            features['rejected_returns'] = len(returns_df[returns_df['status'] == 'rejected'])
            features['fraud_flags'] = len(returns_df[returns_df.get('fraudFlag', False) == True])
            
            # Time-based features
            if 'createdAt' in returns_df.columns:
                returns_df['createdAt'] = pd.to_datetime(returns_df['createdAt'])
                now = datetime.now()
                
                # Returns in last 30 days
                last_30_days = returns_df[returns_df['createdAt'] > now - timedelta(days=30)]
                features['returns_last_30_days'] = len(last_30_days)
                
                # Returns in last 90 days
                last_90_days = returns_df[returns_df['createdAt'] > now - timedelta(days=90)]
                features['returns_last_90_days'] = len(last_90_days)
                
                # Average time between returns
                if len(returns_df) > 1:
                    sorted_dates = returns_df['createdAt'].sort_values()
                    time_diffs = sorted_dates.diff().dt.total_seconds() / (24 * 3600)  # days
                    features['avg_days_between_returns'] = time_diffs.mean()
                else:
                    features['avg_days_between_returns'] = 0
            else:
                features['returns_last_30_days'] = 0
                features['returns_last_90_days'] = 0
                features['avg_days_between_returns'] = 0
            
            # Financial features
            if 'price' in returns_df.columns:
                features['avg_return_amount'] = returns_df['price'].mean()
                features['max_return_amount'] = returns_df['price'].max()
                features['total_return_amount'] = returns_df['price'].sum()
            else:
                features['avg_return_amount'] = 0
                features['max_return_amount'] = 0
                features['total_return_amount'] = 0
        else:
            # Default values for new users
            features.update({
                'total_returns': 0,
                'approved_returns': 0,
                'rejected_returns': 0,
                'fraud_flags': 0,
                'returns_last_30_days': 0,
                'returns_last_90_days': 0,
                'avg_days_between_returns': 0,
                'avg_return_amount': 0,
                'max_return_amount': 0,
                'total_return_amount': 0
            })
        
        # Create DataFrame
        df = pd.DataFrame([features])
        
        # Ensure all expected columns are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Reorder columns to match training
        df = df[self.feature_columns]
        
        return df
    
    def _encode_reason(self, reason: str) -> int:
        """Encode return reason to numeric"""
        reason_mapping = {
            'wrong_size': 1,
            'wrong_color': 2,
            'defective': 3,
            'wrong_item': 4,
            'damaged_shipping': 5,
            'quality_issue': 6,
            'not_as_described': 7,
            'changed_mind': 8
        }
        return reason_mapping.get(reason, 0)
    
    def score_return(self, new_return: Dict[str, Any], historical_returns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Score a new return for fraud risk"""
        try:
            # Extract features
            features_df = self.extract_features(new_return, historical_returns)
            
            # Scale features
            features_scaled = self.scaler.transform(features_df)
            
            # Make prediction
            fraud_probability = self.model.predict_proba(features_scaled)[0][1]  # Probability of fraud
            risk_score = float(fraud_probability)
            
            # Determine risk level and prediction
            if risk_score > 0.7:
                risk_level = "HIGH"
                prediction = "FRAUD"
            elif risk_score > 0.4:
                risk_level = "MEDIUM"
                prediction = "SUSPICIOUS"
            else:
                risk_level = "LOW"
                prediction = "LEGITIMATE"
            
            return {
                "risk_score": round(risk_score, 3),
                "risk_level": risk_level,
                "prediction": prediction,
                "features_used": list(features_df.columns),
                "confidence": max(risk_score, 1 - risk_score)  # Higher of fraud/legitimate probability
            }
            
        except Exception as e:
            print(f"Error scoring return: {e}")
            return {
                "risk_score": 0.5,
                "risk_level": "MEDIUM",
                "prediction": "SUSPICIOUS",
                "error": str(e)
            }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) != 3:
        print("Usage: python return_fraud_predictor.py <new_return_json> <historical_returns_json>")
        sys.exit(1)
    
    try:
        # Initialize predictor
        predictor = ReturnFraudPredictor()
        
        # Load input data
        new_return = json.loads(sys.argv[1])
        historical_returns = json.loads(sys.argv[2])
        
        # Score the return
        result = predictor.score_return(new_return, historical_returns)
        
        # Output result
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
