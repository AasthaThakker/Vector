import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Return from "@/models/Return";
import Inventory from "@/models/Inventory";
import AutomationLog from "@/models/AutomationLog";

export async function POST() {
  try {
    await connectDB();

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
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
      { productName: "Classic Cotton Tee", category: "tshirt", size: "L", color: "Black", stock: 150 },
      { productName: "Classic Cotton Tee", category: "tshirt", size: "M", color: "White", stock: 120 },
      { productName: "Classic Cotton Tee", category: "tshirt", size: "S", color: "Navy", stock: 80 },
      { productName: "Graphic Print Tee", category: "tshirt", size: "M", color: "White", stock: 200 },
      { productName: "Graphic Print Tee", category: "tshirt", size: "L", color: "Black", stock: 150 },
      { productName: "Premium V-Neck", category: "tshirt", size: "XL", color: "Gray", stock: 90 },
      { productName: "Urban Runner Sneakers", category: "shoes", size: "10", color: "White", stock: 45 },
      { productName: "Urban Runner Sneakers", category: "shoes", size: "9", color: "Black", stock: 60 },
      { productName: "Classic Leather Shoes", category: "shoes", size: "11", color: "Brown", stock: 30 },
      { productName: "Sport Running Shoes", category: "shoes", size: "8", color: "Red", stock: 75 },
      { productName: "Premium Zip Hoodie", category: "hoodie", size: "M", color: "Navy", stock: 80 },
      { productName: "Premium Zip Hoodie", category: "hoodie", size: "L", color: "Black", stock: 65 },
      { productName: "Pullover Hoodie", category: "hoodie", size: "S", color: "Gray", stock: 95 },
      { productName: "Fleece Hoodie", category: "hoodie", size: "XL", color: "Forest Green", stock: 40 },
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
