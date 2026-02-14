#!/usr/bin/env python3
"""
Script to clear and reseed the database
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/vector_returns")
DB_NAME = MONGODB_URI.split("/")[-1] if "/" in MONGODB_URI else "vector_returns"

def clear_and_reseed():
    """Clear database and reseed via API"""
    try:
        # Connect to MongoDB and clear collections
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        print(f"Connected to MongoDB: {MONGODB_URI}")
        
        # Clear existing data
        print("Clearing existing data...")
        db.users.delete_many({})
        db.orders.delete_many({})
        db.returns.delete_many({})
        db.automationlogs.delete_many({})
        
        print("✅ Cleared existing data")
        
        client.close()
        
        # Call seed API
        print("Calling seed API...")
        response = requests.post("http://localhost:3000/api/seed", 
                              json={"force": True},
                              headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            print("✅ Database reseeded successfully!")
            print(response.json())
        else:
            print(f"❌ Failed to reseed: {response.status_code}")
            print(response.text)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    clear_and_reseed()
