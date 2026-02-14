#!/usr/bin/env python3
"""
Script to generate 100 random orders for all customers
"""

import os
import sys
import json
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/vector_returns")
DB_NAME = MONGODB_URI.split("/")[-1] if "/" in MONGODB_URI else "vector_returns"

# Product catalog
PRODUCT_CATALOG = [
    {
        "productId": "TSHIRT-001",
        "name": "Classic Cotton Tee", 
        "category": "tshirt",
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Black", "White", "Navy", "Gray"],
        "basePrice": 1299
    },
    {
        "productId": "TSHIRT-002",
        "name": "Graphic Print Tee",
        "category": "tshirt", 
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["White", "Black", "Red"],
        "basePrice": 999
    },
    {
        "productId": "TSHIRT-003",
        "name": "Premium V-Neck",
        "category": "tshirt",
        "sizes": ["S", "M", "L", "XL"], 
        "colors": ["Navy", "Black", "White"],
        "basePrice": 1499
    },
    {
        "productId": "SHOES-001",
        "name": "Urban Runner Sneakers",
        "category": "shoes",
        "sizes": ["8", "9", "10", "11"],
        "colors": ["White", "Black", "Blue"],
        "basePrice": 3499
    },
    {
        "productId": "SHOES-002", 
        "name": "Classic Leather Shoes",
        "category": "shoes",
        "sizes": ["8", "9", "10", "11"],
        "colors": ["Brown", "Black"],
        "basePrice": 4299
    },
    {
        "productId": "SHOES-003",
        "name": "Sport Running Shoes", 
        "category": "shoes",
        "sizes": ["7", "8", "9", "10", "11"],
        "colors": ["Red", "Blue", "Black"],
        "basePrice": 2999
    },
    {
        "productId": "HOODIE-001",
        "name": "Premium Zip Hoodie",
        "category": "hoodie",
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Navy", "Black", "Gray", "White"],
        "basePrice": 2499
    },
    {
        "productId": "HOODIE-002",
        "name": "Pullover Hoodie",
        "category": "hoodie", 
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Black", "Gray", "Navy"],
        "basePrice": 2299
    },
    {
        "productId": "HOODIE-003",
        "name": "Fleece Hoodie",
        "category": "hoodie",
        "sizes": ["M", "L", "XL"],
        "colors": ["Forest Green", "Burgundy", "Black"],
        "basePrice": 2799
    }
]

def get_customer_users(db):
    """Get all customer users from database"""
    users_collection = db.users
    return list(users_collection.find({"role": "customer"}))

def generate_random_product():
    """Generate a random product with variations"""
    product = random.choice(PRODUCT_CATALOG)
    size = random.choice(product["sizes"])
    color = random.choice(product["colors"])
    price = product["basePrice"] + random.randint(-250, 500)
    
    return {
        "productId": product["productId"],
        "name": product["name"],
        "category": product["category"],
        "size": size,
        "color": color,
        "price": price,
        "imageUrl": ""
    }

def generate_random_order(customer, order_date):
    """Generate a random order for a customer"""
    # 40% chance of multiple products
    num_products = 2 if random.random() > 0.6 else 1
    
    products = []
    total_amount = 0
    
    for _ in range(num_products):
        product = generate_random_product()
        products.append(product)
        total_amount += product["price"]
    
    # Most orders are delivered
    statuses = ["delivered", "delivered", "delivered", "shipped", "processing", "cancelled"]
    status = random.choice(statuses)
    
    return {
        "userId": customer["_id"],
        "products": products,
        "orderDate": order_date,
        "status": status,
        "totalAmount": total_amount,
        "createdAt": order_date,
        "updatedAt": order_date
    }

def generate_orders():
    """Generate 100 random orders for all customers"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        print(f"Connected to MongoDB: {MONGODB_URI}")
        
        # Get all customer users
        customers = get_customer_users(db)
        
        if not customers:
            print("No customer users found in database!")
            print("Please seed the database first using /api/seed")
            return
        
        print(f"Found {len(customers)} customer users")
        
        # Generate 100 orders
        orders = []
        start_date = datetime(2026, 1, 15)  # January 15, 2026
        
        for i in range(100):
            # Random customer
            customer = random.choice(customers)
            
            # Random order date within the last 6 months
            days_ago = random.randint(0, 180)
            order_date = start_date + timedelta(days=days_ago)
            
            # Generate order
            order = generate_random_order(customer, order_date)
            orders.append(order)
        
        # Insert orders into database
        orders_collection = db.orders
        result = orders_collection.insert_many(orders)
        
        print(f"\n✅ Successfully generated {len(result.inserted_ids)} orders!")
        
        # Print summary
        status_counts = {}
        customer_order_counts = {}
        
        for order in orders:
            status = order["status"]
            user_id = str(order["userId"])
            
            status_counts[status] = status_counts.get(status, 0) + 1
            customer_order_counts[user_id] = customer_order_counts.get(user_id, 0) + 1
        
        print(f"\n📊 Order Summary:")
        print(f"   Total Orders: {len(orders)}")
        print(f"   Total Customers: {len(customer_order_counts)}")
        print(f"\n📈 Status Distribution:")
        for status, count in sorted(status_counts.items()):
            print(f"   {status}: {count}")
        
        print(f"\n👥 Orders per Customer:")
        for user_id, count in sorted(customer_order_counts.items()):
            customer_name = next((c["name"] for c in customers if str(c["_id"]) == user_id), "Unknown")
            print(f"   {customer_name}: {count} orders")
        
        print(f"\n🎉 Order generation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error generating orders: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Starting order generation...")
    print(f"📅 Generating 100 random orders for all customers")
    print(f"📍 MongoDB URI: {MONGODB_URI}")
    print("-" * 50)
    
    generate_orders()
