#!/usr/bin/env python3
"""
Script to generate 500+ fashion inventory items with realistic data
"""

import os
import sys
import json
import random
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/vector_returns")
DB_NAME = MONGODB_URI.split("/")[-1] if "/" in MONGODB_URI else "vector_returns"

# Fashion data
BRANDS = [
    "Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Gap", "Levi's", "Calvin Klein",
    "Tommy Hilfiger", "Ralph Lauren", "Tom Ford", "Gucci", "Prada", "Versace",
    "Burberry", "Coach", "Michael Kors", "Kate Spade", "Forever 21", "Urban Outfitters",
    "American Eagle", "Aerie", "Free People", "Anthropologie", "Reformation", "Everlane",
    "Patagonia", "The North Face", "Columbia", "Lululemon", "Athleta", "Fabletics"
]

CATEGORIES = {
    "tshirt": {
        "subcategory": ["crew neck", "v-neck", "graphic", "plain", "pocket", "long sleeve"],
        "materials": ["cotton", "polyester", "blend", "organic cotton", "modal", "bamboo"],
        "styles": ["casual", "athletic", "formal", "vintage", "modern", "minimalist"],
        "base_price": (299, 1999)
    },
    "shirt": {
        "subcategory": ["dress shirt", "casual shirt", "flannel", "oxford", "linen", "chambray"],
        "materials": ["cotton", "linen", "silk", "polyester", "blend", "denim"],
        "styles": ["formal", "casual", "business", "vintage", "modern", "classic"],
        "base_price": (799, 3499)
    },
    "pants": {
        "subcategory": ["dress pants", "chinos", "cargo", "joggers", "leggings", "trousers"],
        "materials": ["cotton", "wool", "polyester", "denim", "corduroy", "twill"],
        "styles": ["formal", "casual", "athletic", "business", "relaxed", "slim"],
        "base_price": (999, 4999)
    },
    "jeans": {
        "subcategory": ["skinny", "straight", "bootcut", "relaxed", "slim", "wide leg"],
        "materials": ["denim", "stretch denim", "raw denim", "lightweight denim"],
        "styles": ["casual", "vintage", "modern", "distressed", "classic", "trendy"],
        "base_price": (1499, 5999)
    },
    "dress": {
        "subcategory": ["maxi", "midi", "mini", "cocktail", "formal", "casual"],
        "materials": ["cotton", "silk", "polyester", "chiffon", "satin", "velvet"],
        "styles": ["formal", "casual", "evening", "summer", "winter", "cocktail"],
        "base_price": (1999, 8999)
    },
    "jacket": {
        "subcategory": ["bomber", "denim", "leather", "windbreaker", "varsity", "track"],
        "materials": ["leather", "denim", "polyester", "nylon", "cotton", "suede"],
        "styles": ["casual", "sporty", "motorcycle", "classic", "modern", "vintage"],
        "base_price": (2499, 12999)
    },
    "hoodie": {
        "subcategory": ["pullover", "zip-up", "oversized", "cropped", "fleece", "graphic"],
        "materials": ["cotton", "fleece", "polyester", "blend", "french terry"],
        "styles": ["casual", "athletic", "streetwear", "comfort", "trendy", "classic"],
        "base_price": (1299, 4999)
    },
    "sweater": {
        "subcategory": ["crewneck", "v-neck", "turtleneck", "cardigan", "pullover", "cable knit"],
        "materials": ["wool", "cotton", "cashmere", "acrylic", "alpaca", "blend"],
        "styles": ["casual", "formal", "cozy", "elegant", "vintage", "modern"],
        "base_price": (1799, 6999)
    },
    "shorts": {
        "subcategory": ["denim", "cargo", "athletic", "bermuda", "board", "chino"],
        "materials": ["cotton", "denim", "polyester", "nylon", "linen", "blend"],
        "styles": ["casual", "athletic", "beach", "urban", "preppy", "sporty"],
        "base_price": (799, 2999)
    },
    "skirt": {
        "subcategory": ["mini", "midi", "maxi", "pencil", "a-line", "pleated"],
        "materials": ["cotton", "polyester", "silk", "denim", "wool", "chiffon"],
        "styles": ["formal", "casual", "trendy", "classic", "modern", "vintage"],
        "base_price": (1299, 4999)
    },
    "blazer": {
        "subcategory": ["single breasted", "double breasted", "casual", "formal", "structured", "unstructured"],
        "materials": ["wool", "cotton", "polyester", "linen", "velvet", "silk blend"],
        "styles": ["formal", "business", "casual", "modern", "classic", "elegant"],
        "base_price": (3999, 14999)
    },
    "coat": {
        "subcategory": ["wool coat", "trench coat", "peacoat", "overcoat", "parka", "duster"],
        "materials": ["wool", "cotton", "polyester", "cashmere", "down", "faux fur"],
        "styles": ["formal", "casual", "winter", "classic", "modern", "elegant"],
        "base_price": (4999, 19999)
    },
    "polo": {
        "subcategory": ["classic", "performance", "pique", "mesh", "long sleeve", "striped"],
        "materials": ["cotton", "polyester", "pique", "mesh", "blend", "performance fabric"],
        "styles": ["casual", "sporty", "preppy", "golf", "tennis", "classic"],
        "base_price": (999, 3499)
    },
    "tanktop": {
        "subcategory": ["camisole", "athletic", "cropped", "ribbed", "basic", "graphic"],
        "materials": ["cotton", "polyester", "spandex", "modal", "bamboo", "blend"],
        "styles": ["casual", "athletic", "layering", "basic", "trendy", "comfort"],
        "base_price": (499, 1999)
    },
    "cardigan": {
        "subcategory": ["long", "short", "chunky", "lightweight", "button-up", "open front"],
        "materials": ["wool", "cotton", "cashmere", "acrylic", "alpaca", "blend"],
        "styles": ["casual", "cozy", "elegant", "vintage", "modern", "classic"],
        "base_price": (1499, 5999)
    }
}

COLORS = [
    "Black", "White", "Gray", "Navy", "Blue", "Red", "Green", "Pink", "Brown", "Beige",
    "Cream", "Ivory", "Charcoal", "Maroon", "Burgundy", "Olive", "Khaki", "Tan", "Coral",
    "Teal", "Purple", "Lavender", "Mint", "Peach", "Rust", "Mustard", "Wine", "Forest",
    "Sky Blue", "Royal Blue", "Emerald", "Ruby", "Gold", "Silver", "Bronze", "Copper"
]

SIZES = {
    "tops": ["XS", "S", "M", "L", "XL", "XXL"],
    "bottoms": ["26", "28", "30", "32", "34", "36", "38", "40"],
    "dresses": ["XS", "S", "M", "L", "XL", "XXL"],
    "one_size": ["One Size"]
}

SEASONS = ["spring", "summer", "fall", "winter", "all"]
GENDERS = ["men", "women", "unisex"]

TAGS = [
    "new arrival", "bestseller", "sale", "limited edition", "exclusive", "trending",
    "classic", "vintage", "modern", "sustainable", "organic", "comfortable", "stylish",
    "versatile", "essential", "premium", "luxury", "affordable", "popular", "featured"
]

def generate_sku(category, brand, color, size):
    """Generate unique SKU"""
    brand_code = brand[:3].upper()
    cat_code = category[:3].upper()
    color_code = color[:3].upper()
    size_code = str(size).replace(" ", "").upper()
    random_num = random.randint(1000, 9999)
    return f"{brand_code}-{cat_code}-{color_code}-{size_code}-{random_num}"

def get_size_for_category(category):
    """Get appropriate sizes for category"""
    if category in ["tshirt", "shirt", "hoodie", "sweater", "polo", "tanktop", "cardigan", "jacket", "blazer", "coat"]:
        return random.choice(SIZES["tops"])
    elif category in ["pants", "jeans", "shorts"]:
        return random.choice(SIZES["bottoms"])
    elif category in ["dress", "skirt"]:
        return random.choice(SIZES["dresses"])
    else:
        return random.choice(SIZES["one_size"])

def generate_inventory_item(index):
    """Generate a single inventory item"""
    category = random.choice(list(CATEGORIES.keys()))
    category_data = CATEGORIES[category]
    
    brand = random.choice(BRANDS)
    color = random.choice(COLORS)
    size = get_size_for_category(category)
    subcategory = random.choice(category_data["subcategory"])
    material = random.choice(category_data["materials"])
    style = random.choice(category_data["styles"])
    gender = random.choice(GENDERS)
    season = random.choice(SEASONS)
    
    base_price_min, base_price_max = category_data["base_price"]
    base_price = random.randint(base_price_min, base_price_max)
    
    # Add price variation based on brand and material
    if brand in ["Gucci", "Prada", "Versace", "Tom Ford"]:
        base_price = int(base_price * 2.5)
    elif brand in ["Nike", "Adidas", "Zara", "H&M"]:
        base_price = int(base_price * 0.8)
    
    if material in ["cashmere", "silk", "leather", "wool"]:
        base_price = int(base_price * 1.3)
    
    # Sale price (30% of items are on sale)
    sale_price = None
    if random.random() < 0.3:
        sale_price = int(base_price * 0.7)
    
    # Stock levels
    stock = random.randint(0, 200)
    min_stock = random.randint(5, 20)
    
    # Tags
    num_tags = random.randint(2, 5)
    item_tags = random.sample(TAGS, num_tags)
    
    # Product name
    product_name = f"{brand} {subcategory.title()} {color} {category.title()}"
    
    # Image URL (placeholder)
    image_url = f"https://images.unsplash.com/photo-{random.randint(1000000000, 9999999999)}?w=400&h=500&fit=crop"
    
    return {
        "productName": product_name,
        "category": category,
        "subcategory": subcategory,
        "brand": brand,
        "size": size,
        "color": color,
        "material": material,
        "price": base_price,
        "salePrice": sale_price,
        "sku": generate_sku(category, brand, color, size),
        "stock": stock,
        "minStock": min_stock,
        "season": season,
        "gender": gender,
        "style": style,
        "imageUrl": image_url,
        "tags": item_tags,
        "isActive": stock > 0,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }

def generate_inventory():
    """Generate 500+ inventory items"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        print(f"Connected to MongoDB: {MONGODB_URI}")
        
        # Clear existing inventory data
        inventory_collection = db.inventories
        inventory_collection.delete_many({})
        print("Cleared existing inventory data")
        
        # Generate inventory items
        inventory_items = []
        num_items = 500 + random.randint(0, 100)  # 500-600 items
        
        print(f"Generating {num_items} fashion inventory items...")
        
        for i in range(num_items):
            item = generate_inventory_item(i)
            inventory_items.append(item)
            
            if (i + 1) % 100 == 0:
                print(f"Generated {i + 1} items...")
        
        # Insert items in batches
        batch_size = 100
        for i in range(0, len(inventory_items), batch_size):
            batch = inventory_items[i:i + batch_size]
            inventory_collection.insert_many(batch)
            print(f"Inserted batch {i//batch_size + 1}/{(len(inventory_items) + batch_size - 1)//batch_size}")
        
        # Get statistics
        total_items = inventory_collection.count_documents({})
        total_value = list(inventory_collection.aggregate([
            {"$group": {"_id": None, "totalValue": {"$sum": "$price"}}}
        ]))[0]["totalValue"]
        
        category_counts = inventory_collection.aggregate([
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ])
        
        brand_counts = inventory_collection.aggregate([
            {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ])
        
        print(f"\n✅ Successfully generated {total_items} fashion inventory items!")
        print(f"💰 Total inventory value: Rs.{total_value:,}")
        print(f"\n📊 Category Distribution:")
        for cat in category_counts:
            print(f"   {cat['_id']}: {cat['count']} items")
        
        print(f"\n🏷️ Top Brands:")
        for brand in brand_counts:
            print(f"   {brand['_id']}: {brand['count']} items")
        
        print(f"\n🎉 Fashion inventory generation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error generating inventory: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Starting fashion inventory generation...")
    print(f"📅 Generating 500+ fashion inventory items")
    print(f"📍 MongoDB URI: {MONGODB_URI}")
    print("-" * 50)
    
    generate_inventory()
