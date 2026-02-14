import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Return from "@/models/Return";
import Inventory from "@/models/Inventory";
import AutomationLog from "@/models/AutomationLog";

export async function POST(request: Request) {
  try {
    await connectDB();

    // Check if force parameter is provided
    const body = await request.json().catch(() => ({}));
    const { force } = body;

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      return NextResponse.json({
        message: "Database already seeded. Use these credentials to log in:",
        credentials: {
          customers: [
            { email: "customer@vector.com", password: "password123", name: "Jane Doe" },
            { email: "john.smith@email.com", password: "password123", name: "John Smith" },
            { email: "emily.j@email.com", password: "password123", name: "Emily Johnson" },
            { email: "michael.b@email.com", password: "password123", name: "Michael Brown" },
            { email: "sarah.davis@email.com", password: "password123", name: "Sarah Davis" },
            { email: "robert.w@email.com", password: "password123", name: "Robert Wilson" },
          ],
          admin: { email: "admin@vector.com", password: "password123" },
          warehouse: { email: "warehouse@vector.com", password: "password123" },
          logistics: { email: "logistics@vector.com", password: "password123" },
        },
      });
    }

    // If force is true, clear existing data
    if (force) {
      await User.deleteMany({});
      await Order.deleteMany({});
      await Return.deleteMany({});
      await AutomationLog.deleteMany({});
      console.log("Cleared existing data for reseeding");
    }

    // Hash password for demo users
    const hashedPw = await bcrypt.hash("password123", 12);

    // Create demo users
    const users = await User.insertMany([
      { name: "Jane Doe", email: "customer@vector.com", password: hashedPw, role: "customer", trustScore: 92 },
      { name: "Admin User", email: "admin@vector.com", password: hashedPw, role: "admin", trustScore: 100 },
      { name: "Warehouse Manager", email: "warehouse@vector.com", password: hashedPw, role: "warehouse", trustScore: 100 },
      { name: "Logistics Partner", email: "logistics@vector.com", password: hashedPw, role: "logistics", trustScore: 100 },
      { name: "John Smith", email: "john.smith@email.com", password: hashedPw, role: "customer", trustScore: 85 },
      { name: "Emily Johnson", email: "emily.j@email.com", password: hashedPw, role: "customer", trustScore: 78 },
      { name: "Michael Brown", email: "michael.b@email.com", password: hashedPw, role: "customer", trustScore: 95 },
      { name: "Sarah Davis", email: "sarah.davis@email.com", password: hashedPw, role: "customer", trustScore: 88 },
      { name: "Robert Wilson", email: "robert.w@email.com", password: hashedPw, role: "customer", trustScore: 91 },
    ]);

    const customerUsers = users.filter(u => u.role === "customer");
    
    if (customerUsers.length === 0) {
      throw new Error("No customer users found after creation");
    }

    // Create demo orders for each customer (minimum 5 orders per customer)
    const allOrders: any[] = [];
    
    // Product catalog for variety
    const productCatalog = [
      { productId: "TSHIRT-001", name: "Classic Cotton Tee", category: "tshirt", sizes: ["S", "M", "L", "XL"], colors: ["Black", "White", "Navy", "Gray"], basePrice: 1299 },
      { productId: "TSHIRT-002", name: "Graphic Print Tee", category: "tshirt", sizes: ["S", "M", "L", "XL"], colors: ["White", "Black", "Red"], basePrice: 999 },
      { productId: "TSHIRT-003", name: "Premium V-Neck", category: "tshirt", sizes: ["S", "M", "L", "XL"], colors: ["Navy", "Black", "White"], basePrice: 1499 },
      { productId: "SHOES-001", name: "Urban Runner Sneakers", category: "shoes", sizes: ["8", "9", "10", "11"], colors: ["White", "Black", "Blue"], basePrice: 3499 },
      { productId: "SHOES-002", name: "Classic Leather Shoes", category: "shoes", sizes: ["8", "9", "10", "11"], colors: ["Brown", "Black"], basePrice: 4299 },
      { productId: "SHOES-003", name: "Sport Running Shoes", category: "shoes", sizes: ["7", "8", "9", "10", "11"], colors: ["Red", "Blue", "Black"], basePrice: 2999 },
      { productId: "HOODIE-001", name: "Premium Zip Hoodie", category: "hoodie", sizes: ["S", "M", "L", "XL"], colors: ["Navy", "Black", "Gray", "White"], basePrice: 2499 },
      { productId: "HOODIE-002", name: "Pullover Hoodie", category: "hoodie", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Gray", "Navy"], basePrice: 2299 },
      { productId: "HOODIE-003", name: "Fleece Hoodie", category: "hoodie", sizes: ["M", "L", "XL"], colors: ["Forest Green", "Burgundy", "Black"], basePrice: 2799 },
    ];

    // Generate 5-7 orders for each customer
    customerUsers.forEach((customer, customerIndex) => {
      const orderCount = 5 + Math.floor(Math.random() * 3); // 5-7 orders per customer
      
      for (let i = 0; i < orderCount; i++) {
        const orderDate = new Date(2026, 0, 15 + (customerIndex * 10) + (i * 8)); // Stagger dates
        const numProducts = Math.random() > 0.6 ? 2 : 1; // 40% chance of multiple products
        const products = [];
        let totalAmount = 0;
        
        for (let j = 0; j < numProducts; j++) {
          const product = productCatalog[Math.floor(Math.random() * productCatalog.length)];
          const size = product.sizes[Math.floor(Math.random() * product.sizes.length)];
          const color = product.colors[Math.floor(Math.random() * product.colors.length)];
          const price = product.basePrice + Math.floor(Math.random() * 500) - 250; // Price variation
          
          products.push({
            productId: product.productId,
            name: product.name,
            category: product.category,
            size,
            color,
            price,
            imageUrl: "",
          });
          totalAmount += price;
        }
        
        const statuses = ["delivered", "delivered", "delivered", "shipped", "processing"]; // Most are delivered
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        allOrders.push({
          userId: customer._id,
          products,
          orderDate,
          status,
          totalAmount,
        });
      }
    });

    const orders = await Order.insertMany(allOrders);

    // Create demo returns with proper order references
    const returns = await Return.insertMany([
      {
        orderId: orders[0]._id, // First order from first customer
        userId: customerUsers[0]._id,
        productId: orders[0].products[0].productId,
        price: orders[0].products[0].price,
        reason: "wrong_size",
        description: "Ordered size 10 but fits like a size 9. Need size 11 instead.",
        imageUrl: "",
        returnMethod: "pickup",
        qrCodeData: "",
        dropboxLocation: "",
        status: "approved",
        createdAt: new Date("2026-02-05"),
      },
      {
        orderId: orders[1]._id, // Second order from first customer
        userId: customerUsers[0]._id,
        productId: orders[1].products[0].productId,
        price: orders[1].products[0].price,
        reason: "defective",
        description: "The stitching on the collar came loose after first wash.",
        imageUrl: "",
        returnMethod: "dropbox",
        qrCodeData: "",
        dropboxLocation: "Koramangala Drop Box",
        status: "pending",
        createdAt: new Date("2026-02-10"),
      },
      {
        orderId: orders[8]._id, // Order from second customer
        userId: customerUsers[1]._id,
        productId: orders[8].products[0].productId,
        price: orders[8].products[0].price,
        reason: "wrong_item",
        description: "Received a different color than ordered.",
        imageUrl: "",
        returnMethod: "pickup",
        qrCodeData: "",
        dropboxLocation: "",
        status: "approved",
        createdAt: new Date("2026-02-12"),
      },
      {
        orderId: orders[15]._id, // Order from third customer
        userId: customerUsers[2]._id,
        productId: orders[15].products[0].productId,
        price: orders[15].products[0].price,
        reason: "quality_issue",
        description: "Material quality is not as expected.",
        imageUrl: "",
        returnMethod: "dropbox",
        qrCodeData: "",
        dropboxLocation: "Indiranagar Drop Box",
        status: "pending",
        createdAt: new Date("2026-02-15"),
      },
    ]);

    // Create demo inventory for all products
    await Inventory.insertMany([
      { 
        productName: "Classic Cotton Tee", 
        category: "tshirt", 
        subcategory: "basic",
        brand: "Vector Basics",
        size: "L", 
        color: "Black", 
        material: "Cotton",
        price: 1299,
        sku: "TSHIRT-001-L-BLK",
        stock: 150,
        minStock: 10,
        season: "all",
        gender: "unisex",
        tags: ["basic", "cotton", "casual"],
        isActive: true
      },
      { 
        productName: "Classic Cotton Tee", 
        category: "tshirt", 
        subcategory: "basic",
        brand: "Vector Basics",
        size: "M", 
        color: "White", 
        material: "Cotton",
        price: 1299,
        sku: "TSHIRT-001-M-WHT",
        stock: 120,
        minStock: 10,
        season: "all",
        gender: "unisex",
        tags: ["basic", "cotton", "casual"],
        isActive: true
      },
      { 
        productName: "Classic Cotton Tee", 
        category: "tshirt", 
        subcategory: "basic",
        brand: "Vector Basics",
        size: "S", 
        color: "Navy", 
        material: "Cotton",
        price: 1299,
        sku: "TSHIRT-001-S-NVY",
        stock: 80,
        minStock: 10,
        season: "all",
        gender: "unisex",
        tags: ["basic", "cotton", "casual"],
        isActive: true
      },
      { 
        productName: "Graphic Print Tee", 
        category: "tshirt", 
        subcategory: "graphic",
        brand: "Vector Prints",
        size: "M", 
        color: "White", 
        material: "Cotton Blend",
        price: 999,
        sku: "TSHIRT-002-M-WHT",
        stock: 200,
        minStock: 15,
        season: "summer",
        gender: "men",
        tags: ["graphic", "printed", "casual"],
        isActive: true
      },
      { 
        productName: "Graphic Print Tee", 
        category: "tshirt", 
        subcategory: "graphic",
        brand: "Vector Prints",
        size: "L", 
        color: "Black", 
        material: "Cotton Blend",
        price: 999,
        sku: "TSHIRT-002-L-BLK",
        stock: 150,
        minStock: 15,
        season: "summer",
        gender: "men",
        tags: ["graphic", "printed", "casual"],
        isActive: true
      },
      { 
        productName: "Premium V-Neck", 
        category: "tshirt", 
        subcategory: "premium",
        brand: "Vector Premium",
        size: "XL", 
        color: "Gray", 
        material: "Cotton Modal",
        price: 1499,
        sku: "TSHIRT-003-XL-GRY",
        stock: 90,
        minStock: 8,
        season: "all",
        gender: "unisex",
        tags: ["premium", "v-neck", "modal"],
        isActive: true
      },
      { 
        productName: "Urban Runner Sneakers", 
        category: "shoes", 
        subcategory: "sneakers",
        brand: "Vector Sport",
        size: "10", 
        color: "White", 
        material: "Synthetic",
        price: 3499,
        sku: "SHOES-001-10-WHT",
        stock: 45,
        minStock: 5,
        season: "all",
        gender: "men",
        tags: ["sneakers", "running", "urban"],
        isActive: true
      },
      { 
        productName: "Urban Runner Sneakers", 
        category: "shoes", 
        subcategory: "sneakers",
        brand: "Vector Sport",
        size: "9", 
        color: "Black", 
        material: "Synthetic",
        price: 3499,
        sku: "SHOES-001-9-BLK",
        stock: 60,
        minStock: 5,
        season: "all",
        gender: "men",
        tags: ["sneakers", "running", "urban"],
        isActive: true
      },
      { 
        productName: "Classic Leather Shoes", 
        category: "shoes", 
        subcategory: "formal",
        brand: "Vector Formal",
        size: "11", 
        color: "Brown", 
        material: "Genuine Leather",
        price: 4299,
        sku: "SHOES-002-11-BRN",
        stock: 30,
        minStock: 3,
        season: "all",
        gender: "men",
        tags: ["formal", "leather", "oxford"],
        isActive: true
      },
      { 
        productName: "Sport Running Shoes", 
        category: "shoes", 
        subcategory: "running",
        brand: "Vector Sport",
        size: "8", 
        color: "Red", 
        material: "Mesh Synthetic",
        price: 2999,
        sku: "SHOES-003-8-RED",
        stock: 75,
        minStock: 8,
        season: "spring",
        gender: "women",
        tags: ["running", "sport", "mesh"],
        isActive: true
      },
      { 
        productName: "Premium Zip Hoodie", 
        category: "hoodie", 
        subcategory: "zip",
        brand: "Vector Premium",
        size: "M", 
        color: "Navy", 
        material: "Cotton Fleece",
        price: 2499,
        sku: "HOODIE-001-M-NVY",
        stock: 80,
        minStock: 6,
        season: "fall",
        gender: "unisex",
        tags: ["hoodie", "zip", "fleece"],
        isActive: true
      },
      { 
        productName: "Premium Zip Hoodie", 
        category: "hoodie", 
        subcategory: "zip",
        brand: "Vector Premium",
        size: "L", 
        color: "Black", 
        material: "Cotton Fleece",
        price: 2499,
        sku: "HOODIE-001-L-BLK",
        stock: 65,
        minStock: 6,
        season: "fall",
        gender: "unisex",
        tags: ["hoodie", "zip", "fleece"],
        isActive: true
      },
      { 
        productName: "Pullover Hoodie", 
        category: "hoodie", 
        subcategory: "pullover",
        brand: "Vector Basics",
        size: "S", 
        color: "Gray", 
        material: "Cotton Blend",
        price: 2299,
        sku: "HOODIE-002-S-GRY",
        stock: 95,
        minStock: 8,
        season: "winter",
        gender: "men",
        tags: ["hoodie", "pullover", "casual"],
        isActive: true
      },
      { 
        productName: "Fleece Hoodie", 
        category: "hoodie", 
        subcategory: "fleece",
        brand: "Vector Premium",
        size: "XL", 
        color: "Forest Green", 
        material: "Cotton Fleece",
        price: 2799,
        sku: "HOODIE-003-XL-FGR",
        stock: 40,
        minStock: 5,
        season: "winter",
        gender: "unisex",
        tags: ["hoodie", "fleece", "premium"],
        isActive: true
      },
    ]);

    // Create demo automation logs
    await AutomationLog.insertMany([
      { workflowId: "return_request_created", returnId: returns[0]._id, action: "Return request submitted", status: "success", details: "Return created for SHOES-001 via pickup", timestamp: new Date("2026-02-05") },
      { workflowId: "return_status_approved", returnId: returns[0]._id, action: "Status updated to approved", status: "success", details: "Updated by admin (admin@vector.com)", timestamp: new Date("2026-02-05") },
      { workflowId: "return_request_created", returnId: returns[1]._id, action: "Return request submitted", status: "success", details: "Return created for TSHIRT-001 via dropbox", timestamp: new Date("2026-02-10") },
    ]);

    return NextResponse.json({
      message: "Database seeded successfully! Use these credentials to log in:",
      credentials: {
        customers: [
          { email: "customer@vector.com", password: "password123", name: "Jane Doe" },
          { email: "john.smith@email.com", password: "password123", name: "John Smith" },
          { email: "emily.j@email.com", password: "password123", name: "Emily Johnson" },
          { email: "michael.b@email.com", password: "password123", name: "Michael Brown" },
          { email: "sarah.davis@email.com", password: "password123", name: "Sarah Davis" },
          { email: "robert.w@email.com", password: "password123", name: "Robert Wilson" },
        ],
        admin: { email: "admin@vector.com", password: "password123" },
        warehouse: { email: "warehouse@vector.com", password: "password123" },
        logistics: { email: "logistics@vector.com", password: "password123" },
      },
      summary: {
        totalCustomers: customerUsers.length,
        totalOrders: orders.length,
        totalReturns: returns.length,
        totalInventory: 14,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      error: "Failed to seed database", 
      details: errorMessage
    }, { status: 500 });
  }
}
