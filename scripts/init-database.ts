import connectDB from '../lib/mongodb';
import User from '../models/User';
import Order from '../models/Order';
import Return from '../models/Return';
import Inventory from '../models/Inventory';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    await Return.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing data');

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create users
    const users = await User.create([
      {
        name: 'Jane Doe',
        email: 'customer@vector.com',
        password: hashedPassword,
        role: 'customer',
        trustScore: 92
      },
      {
        name: 'Admin User',
        email: 'admin@vector.com',
        password: hashedPassword,
        role: 'admin',
        trustScore: 100
      },
      {
        name: 'Warehouse Manager',
        email: 'warehouse@vector.com',
        password: hashedPassword,
        role: 'warehouse',
        trustScore: 100
      },
      {
        name: 'Logistics Partner',
        email: 'logistics@vector.com',
        password: hashedPassword,
        role: 'logistics',
        trustScore: 100
      }
    ]);
    console.log('Created users');

    const customerUser = users.find(u => u.email === 'customer@vector.com');

    // Create orders
    const orders = await Order.create([
      {
        userId: customerUser!._id,
        products: [{
          productId: 'TSHIRT-001',
          name: 'Classic Cotton Tee',
          category: 'tshirt',
          size: 'L',
          color: 'Black',
          price: 1299,
          imageUrl: ''
        }],
        orderDate: new Date('2026-01-15'),
        status: 'delivered',
        totalAmount: 1299
      },
      {
        userId: customerUser!._id,
        products: [{
          productId: 'SHOES-001',
          name: 'Urban Runner Sneakers',
          category: 'shoes',
          size: '10',
          color: 'White',
          price: 3499,
          imageUrl: ''
        }],
        orderDate: new Date('2026-01-20'),
        status: 'delivered',
        totalAmount: 3499
      },
      {
        userId: customerUser!._id,
        products: [
          {
            productId: 'HOODIE-001',
            name: 'Premium Zip Hoodie',
            category: 'hoodie',
            size: 'M',
            color: 'Navy',
            price: 2499,
            imageUrl: ''
          },
          {
            productId: 'TSHIRT-002',
            name: 'Graphic Print Tee',
            category: 'tshirt',
            size: 'M',
            color: 'White',
            price: 999,
            imageUrl: ''
          }
        ],
        orderDate: new Date('2026-02-01'),
        status: 'delivered',
        totalAmount: 3498
      }
    ]);
    console.log('Created orders');

    // Create returns
    const shoesOrder = orders.find(o => o.products.some(p => p.productId === 'SHOES-001'));
    const tshirtOrder = orders.find(o => o.products.some(p => p.productId === 'TSHIRT-001'));

    await Return.create([
      {
        orderId: shoesOrder!._id,
        userId: customerUser!._id,
        productId: 'SHOES-001',
        reason: 'wrong_size',
        description: 'Ordered size 10 but fits like a size 9. Need size 11 instead.',
        imageUrl: '',
        aiAnalysisResult: null,
        fraudFlag: false,
        validationStatus: 'approved',
        status: 'approved',
        returnMethod: 'pickup',
        qrCodeData: '',
        dropboxLocation: ''
      },
      {
        orderId: tshirtOrder!._id,
        userId: customerUser!._id,
        productId: 'TSHIRT-001',
        reason: 'defective',
        description: 'The stitching on the collar came loose after first wash.',
        imageUrl: '',
        aiAnalysisResult: null,
        fraudFlag: false,
        validationStatus: 'pending',
        status: 'pending',
        returnMethod: 'dropbox',
        qrCodeData: '',
        dropboxLocation: 'Koramangala Drop Box'
      }
    ]);
    console.log('Created returns');

    // Create inventory
    await Inventory.create([
      {
        productName: 'Classic Cotton Tee',
        category: 'tshirt',
        size: 'L',
        color: 'Black',
        stock: 150
      },
      {
        productName: 'Urban Runner Sneakers',
        category: 'shoes',
        size: '10',
        color: 'White',
        stock: 45
      },
      {
        productName: 'Premium Zip Hoodie',
        category: 'hoodie',
        size: 'M',
        color: 'Navy',
        stock: 80
      },
      {
        productName: 'Graphic Print Tee',
        category: 'tshirt',
        size: 'M',
        color: 'White',
        stock: 200
      }
    ]);
    console.log('Created inventory');

    console.log('Database initialized successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
