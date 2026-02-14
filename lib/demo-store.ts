import bcrypt from "bcryptjs";

// In-memory demo data store for when MongoDB is not available
// This allows the app to function fully in preview/demo mode

export interface DemoUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "warehouse" | "logistics";
  trustScore: number;
}

export interface DemoProduct {
  productId: string;
  name: string;
  category: string;
  size: string;
  color: string;
  price: number;
  imageUrl: string;
}

export interface DemoOrder {
  _id: string;
  userId: string;
  products: DemoProduct[];
  orderDate: string;
  status: string;
  totalAmount: number;
}

export interface DemoReturn {
  _id: string;
  orderId: string;
  userId: string;
  productId: string;
  reason: string;
  description: string;
  imageUrl: string;
  returnMethod: string;
  qrCodeData: string;
  dropboxLocation: string;
  status: string;
  createdAt: string;
}

export interface DemoInventory {
  _id: string;
  productName: string;
  category: string;
  size: string;
  color: string;
  stock: number;
}

export interface DemoAutomationLog {
  _id: string;
  workflowId: string;
  returnId: string;
  action: string;
  status: string;
  details: string;
  timestamp: string;
}

const hashedPw = bcrypt.hashSync("password123", 12);

class DemoStore {
  users: DemoUser[] = [
    { _id: "u1", name: "Jane Doe", email: "customer@vector.com", password: hashedPw, role: "customer", trustScore: 92 },
    { _id: "u2", name: "Admin User", email: "admin@vector.com", password: hashedPw, role: "admin", trustScore: 100 },
    { _id: "u3", name: "Warehouse Manager", email: "warehouse@vector.com", password: hashedPw, role: "warehouse", trustScore: 100 },
    { _id: "u4", name: "Logistics Partner", email: "logistics@vector.com", password: hashedPw, role: "logistics", trustScore: 100 },
  ];

  orders: DemoOrder[] = [
    {
      _id: "o1",
      userId: "u1",
      products: [{ productId: "TSHIRT-001", name: "Classic Cotton Tee", category: "tshirt", size: "L", color: "Black", price: 1299, imageUrl: "" }],
      orderDate: "2026-01-15T00:00:00.000Z",
      status: "delivered",
      totalAmount: 1299,
    },
    {
      _id: "o2",
      userId: "u1",
      products: [{ productId: "SHOES-001", name: "Urban Runner Sneakers", category: "shoes", size: "10", color: "White", price: 3499, imageUrl: "" }],
      orderDate: "2026-01-20T00:00:00.000Z",
      status: "delivered",
      totalAmount: 3499,
    },
    {
      _id: "o3",
      userId: "u1",
      products: [
        { productId: "HOODIE-001", name: "Premium Zip Hoodie", category: "hoodie", size: "M", color: "Navy", price: 2499, imageUrl: "" },
        { productId: "TSHIRT-002", name: "Graphic Print Tee", category: "tshirt", size: "M", color: "White", price: 999, imageUrl: "" },
      ],
      orderDate: "2026-02-01T00:00:00.000Z",
      status: "delivered",
      totalAmount: 3498,
    },
  ];

  returns: DemoReturn[] = [
    {
      _id: "r1",
      orderId: "o2",
      userId: "u1",
      productId: "SHOES-001",
      reason: "wrong_size",
      description: "Ordered size 10 but fits like a size 9. Need size 11 instead.",
      imageUrl: "",
      returnMethod: "pickup",
      qrCodeData: "",
      dropboxLocation: "",
      status: "approved",
      createdAt: "2026-02-05T10:00:00.000Z",
    },
    {
      _id: "r2",
      orderId: "o1",
      userId: "u1",
      productId: "TSHIRT-001",
      reason: "defective",
      description: "The stitching on the collar came loose after first wash.",
      imageUrl: "",
      returnMethod: "dropbox",
      qrCodeData: "",
      dropboxLocation: "Koramangala Drop Box",
      status: "pending",
      createdAt: "2026-02-10T14:30:00.000Z",
    },
  ];

  inventory: DemoInventory[] = [
    { _id: "i1", productName: "Classic Cotton Tee", category: "tshirt", size: "L", color: "Black", stock: 150 },
    { _id: "i2", productName: "Urban Runner Sneakers", category: "shoes", size: "10", color: "White", stock: 45 },
    { _id: "i3", productName: "Premium Zip Hoodie", category: "hoodie", size: "M", color: "Navy", stock: 80 },
    { _id: "i4", productName: "Graphic Print Tee", category: "tshirt", size: "M", color: "White", stock: 200 },
  ];

  automationLogs: DemoAutomationLog[] = [
    { _id: "al1", workflowId: "return_request_created", returnId: "r1", action: "Return request submitted", status: "success", details: "Return created for SHOES-001 via pickup", timestamp: "2026-02-05T10:00:05.000Z" },
    { _id: "al2", workflowId: "return_status_approved", returnId: "r1", action: "Status updated to approved", status: "success", details: "Updated by admin (admin@returnhub.com)", timestamp: "2026-02-05T12:30:00.000Z" },
    { _id: "al3", workflowId: "return_request_created", returnId: "r2", action: "Return request submitted", status: "success", details: "Return created for TSHIRT-001 via dropbox", timestamp: "2026-02-10T14:30:05.000Z" },
  ];

  private idCounter = 100;

  nextId(): string {
    return `demo_${++this.idCounter}`;
  }

  findUserByEmail(email: string): DemoUser | undefined {
    return this.users.find((u) => u.email === email.toLowerCase());
  }

  findUserById(id: string): DemoUser | undefined {
    return this.users.find((u) => u._id === id);
  }

  addUser(user: Omit<DemoUser, "_id">): DemoUser {
    const newUser = { ...user, _id: this.nextId() };
    this.users.push(newUser);
    return newUser;
  }

  getOrdersByUser(userId: string): DemoOrder[] {
    return this.orders.filter((o) => o.userId === userId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  getAllOrders(): DemoOrder[] {
    return [...this.orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  getReturnsByUser(userId: string): DemoReturn[] {
    return this.returns.filter((r) => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllReturns(): DemoReturn[] {
    return [...this.returns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findReturnById(id: string): DemoReturn | undefined {
    return this.returns.find((r) => r._id === id);
  }

  addReturn(data: Omit<DemoReturn, "_id" | "createdAt">): DemoReturn {
    const newReturn: DemoReturn = {
      ...data,
      _id: this.nextId(),
      createdAt: new Date().toISOString(),
    };
    this.returns.push(newReturn);
    return newReturn;
  }

  updateReturnStatus(id: string, status: string): DemoReturn | null {
    const r = this.returns.find((r) => r._id === id);
    if (!r) return null;
    r.status = status;
    return r;
  }

  addAutomationLog(log: Omit<DemoAutomationLog, "_id" | "timestamp">): DemoAutomationLog {
    const newLog: DemoAutomationLog = {
      ...log,
      _id: this.nextId(),
      timestamp: new Date().toISOString(),
    };
    this.automationLogs.push(newLog);
    return newLog;
  }

  getAllAutomationLogs(): DemoAutomationLog[] {
    return [...this.automationLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAllInventory(): DemoInventory[] {
    return [...this.inventory];
  }

  updateInventoryStock(id: string, stock: number): DemoInventory | null {
    const item = this.inventory.find((i) => i._id === id);
    if (!item) return null;
    item.stock = stock;
    return item;
  }
}

// Singleton - survives hot reloads
declare global {
  // eslint-disable-next-line no-var
  var _demoStore: DemoStore | undefined;
}

if (!global._demoStore) {
  global._demoStore = new DemoStore();
}

export const demoStore: DemoStore = global._demoStore;
