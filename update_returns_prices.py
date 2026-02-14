#!/usr/bin/env python3
"""
Script to update existing returns with product prices from orders
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/vector_returns")
DB_NAME = MONGODB_URI.split("/")[-1] if "/" in MONGODB_URI else "vector_returns"

def update_returns_with_prices():
    """Update existing returns with product prices from orders"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        print(f"Connected to MongoDB: {MONGODB_URI}")
        
        # Get all returns that don't have a price
        returns_collection = db.returns
        orders_collection = db.orders
        
        # Find returns without price field or with price 0
        returns_to_update = list(returns_collection.find({
            "$or": [
                { "price": { "$exists": False } },
                { "price": 0 }
            ]
        }))
        
        if not returns_to_update:
            print("✅ All returns already have prices. No updates needed.")
            return
        
        print(f"📊 Found {len(returns_to_update)} returns to update")
        
        updated_count = 0
        failed_count = 0
        
        for return_item in returns_to_update:
            try:
                # Get the order for this return
                order = orders_collection.find_one({"_id": return_item["orderId"]})
                
                if not order:
                    print(f"⚠️  Order not found for return {return_item['_id']}")
                    failed_count += 1
                    continue
                
                # Find the product in the order
                product_price = 0
                for product in order.get("products", []):
                    if product["productId"] == return_item["productId"]:
                        product_price = product["price"]
                        break
                
                if product_price == 0:
                    print(f"⚠️  Product not found in order for return {return_item['_id']}")
                    failed_count += 1
                    continue
                
                # Update the return with the price
                result = returns_collection.update_one(
                    {"_id": return_item["_id"]},
                    {"$set": {"price": product_price}}
                )
                
                if result.modified_count > 0:
                    updated_count += 1
                    print(f"✅ Updated return {return_item['_id']} with price ₹{product_price}")
                else:
                    print(f"⚠️  No changes made to return {return_item['_id']}")
                    failed_count += 1
                    
            except Exception as e:
                print(f"❌ Error updating return {return_item['_id']}: {str(e)}")
                failed_count += 1
        
        print(f"\n🎉 Migration completed!")
        print(f"   ✅ Successfully updated: {updated_count} returns")
        print(f"   ❌ Failed updates: {failed_count} returns")
        print(f"   📊 Success rate: {(updated_count / len(returns_to_update) * 100):.1f}%")
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Starting returns price migration...")
    print(f"📍 MongoDB URI: {MONGODB_URI}")
    print("-" * 50)
    
    update_returns_with_prices()
