# Database Setup Guide

## MongoDB Setup

### Prerequisites
- MongoDB installed and running on your system
- Node.js and npm installed

### 1. Install MongoDB

**Windows:**
```bash
# Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
```

**macOS:**
```bash
# Use Homebrew:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian:
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Verify MongoDB is Running

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# Or check if service is running
sudo systemctl status mongodb  # Linux
brew services list | grep mongodb  # macOS
```

### 3. Environment Configuration

The application is configured to use MongoDB with the following connection string:
```
mongodb://127.0.0.1:27017/vector_returns
```

This is already set in `.env.local`.

### 4. Seed the Database

1. Start the application:
```bash
npm run dev
```

2. Visit `http://localhost:3000` in your browser

3. Click the "Seed Demo Data" button to populate the database with:
- Demo users (customer, admin, warehouse, logistics)
- Sample orders and returns
- Inventory data
- Automation logs

### 5. Login with Demo Credentials

After seeding, use these credentials to log in:

- **Customer:** `customer@vector.com` / `password123`
- **Admin:** `admin@vector.com` / `password123`
- **Warehouse:** `warehouse@vector.com` / `password123`
- **Logistics:** `logistics@vector.com` / `password123`

### 6. Database Collections

The application will create the following collections:

- `users` - User accounts and authentication
- `orders` - Customer orders
- `returns` - Return requests
- `inventory` - Product inventory
- `automationlogs` - Workflow automation logs

### 7. Troubleshooting

**MongoDB Connection Failed:**
- Ensure MongoDB is running
- Check the connection string in `.env.local`
- Verify MongoDB is listening on port 27017

**Seeding Fails:**
- Clear existing data: `mongosh vector_returns --eval "db.dropDatabase()"`
- Restart the application and try seeding again

**Login Issues:**
- Verify the database was seeded successfully
- Check the MongoDB logs for errors
- Ensure email addresses match exactly (case-insensitive)

### 8. MongoDB Compass (Optional)

For visual database management, install MongoDB Compass:
- Download from https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://127.0.0.1:27017/vector_returns`

### 9. Production Deployment

For production, update the environment variables:

```env
MONGODB_URI=mongodb://your-production-connection-string
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production
```

## Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer|admin|warehouse|logistics),
  trustScore: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### Orders
```javascript
{
  userId: ObjectId,
  products: [{
    productId: String,
    name: String,
    category: String,
    size: String,
    color: String,
    price: Number,
    imageUrl: String
  }],
  orderDate: Date,
  status: String,
  totalAmount: Number
}
```

### Returns
```javascript
{
  userId: ObjectId,
  productId: String,
  reason: String,
  description: String,
  imageUrl: String,
  returnMethod: String (pickup|dropbox),
  qrCodeData: String,
  dropboxLocation: String,
  status: String,
  createdAt: Date
}
```
