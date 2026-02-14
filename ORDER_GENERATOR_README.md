# Order Generation Script

This Python script generates 100 random orders for all customers in your returns management database.

## Features

- Generates 100 random orders across all customer users
- Random product selection with variations in size, color, and price
- Realistic order date distribution (within last 6 months)
- Multiple product support (40% chance of 2 products per order)
- Status distribution: Mostly delivered, some shipped/processing/cancelled
- Detailed summary report after generation

## Setup

1. Make sure you have Python 3.7+ installed
2. Ensure your `.env.local` file has the MongoDB connection string
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Option 1: Run directly
```bash
python generate_orders.py
```

### Option 2: Use the batch file (Windows)
```bash
run_generate_orders.bat
```

## Prerequisites

- MongoDB must be running
- Database should be seeded with users first (use `/api/seed` endpoint)
- Environment variables configured in `.env.local`

## Output

The script will:
- Connect to your MongoDB database
- Fetch all customer users
- Generate 100 random orders with realistic data
- Insert orders into the `orders` collection
- Display a summary report showing:
  - Total orders generated
  - Order status distribution
  - Orders per customer

## Product Catalog

The script uses a predefined catalog with:
- **T-Shirts**: Classic Cotton Tee, Graphic Print Tee, Premium V-Neck
- **Shoes**: Urban Runner Sneakers, Classic Leather Shoes, Sport Running Shoes  
- **Hoodies**: Premium Zip Hoodie, Pullover Hoodie, Fleece Hoodie

Each product has multiple size and color options with price variations.

## Example Output

```
🚀 Starting order generation...
📅 Generating 100 random orders for all customers
📍 MongoDB URI: mongodb://localhost:27017/returns-management
--------------------------------------------------
Connected to MongoDB: mongodb://localhost:27017/returns-management
Found 6 customer users

✅ Successfully generated 100 orders!

📊 Order Summary:
   Total Orders: 100
   Total Customers: 6

📈 Status Distribution:
   cancelled: 8
   delivered: 62
   processing: 15
   shipped: 15

👥 Orders per Customer:
   Emily Johnson: 18 orders
   Jane Doe: 16 orders
   John Smith: 17 orders
   Michael Brown: 16 orders
   Robert Wilson: 17 orders
   Sarah Davis: 16 orders

🎉 Order generation completed successfully!
```
