# MongoDB Database Setup Guide

This guide will help you set up your online MongoDB database and replace the hardcoded demo data.

## Prerequisites

- MongoDB Atlas account with your database URL
- Node.js and npm/pnpm installed

## Step 1: Configure Environment Variables

Add your MongoDB URL to the `.env.local` file:

```env
MONGODB_URI=mongodb+srv://nandgajera20_db_user:KmA26zknPmESofCs@ecommerce.ceefkrb.mongodb.net/
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

⚠️ **Important**: Make sure to use `MONGODB_URI` (not `MONGODB_URL`) as that's what the existing connection file expects.

## Step 2: Install Dependencies

The project already has mongoose installed, but make sure you have ts-node for the initialization script:

```bash
npm install -D ts-node
# or
pnpm add -D ts-node
```

## Step 3: Initialize Database with Schema and Data

Run the database initialization script to create the schema and populate it with the demo data:

```bash
npm run init-db
# or
pnpm init-db
```

This script will:
- Connect to your MongoDB database
- Create all the necessary collections with proper schemas
- Populate the database with the demo users, orders, returns, and inventory
- Hash passwords for security

## Step 4: Start the Application

```bash
npm run dev
# or
pnpm dev
```

## Database Schema

The following collections will be created:

### Users
- name, email, password (hashed), role, trustScore
- Roles: customer, admin, warehouse, logistics

### Orders
- userId, products (array), orderDate, status, totalAmount
- Status: delivered, shipped, processing, cancelled

### Returns
- orderId, userId, productId, reason, description, imageUrl
- AI analysis results, fraud flag, validation status
- Return workflow status, method (pickup/dropbox), QR codes

### Inventory
- productName, category, size, color, stock
- Categories: tshirt, shoes, hoodie

### Automation Logs
- workflowId, returnId, action, status, details, timestamp

## Demo Accounts

After initialization, you can use these accounts to test:

- **Customer**: customer@vector.com / password123
- **Admin**: admin@vector.com / password123  
- **Warehouse**: warehouse@vector.com / password123
- **Logistics**: logistics@vector.com / password123

## Migration Complete

✅ All hardcoded data has been replaced with MongoDB operations
✅ All API routes now use the database
✅ Webhooks and automation are connected to MongoDB
✅ Schema matches the original demo data structure

Your ecommerce application is now running with a live MongoDB database!
