# Fashion Inventory Management System

A comprehensive inventory management system for fashion clothing products with dynamic frontend and backend capabilities.

## 📊 **Features**

### **Enhanced Schema**
- **15 Fashion Categories**: T-shirts, shirts, pants, jeans, dresses, jackets, hoodies, sweaters, shorts, skirts, blazers, coats, polos, tank tops, cardigans
- **Rich Product Details**: Brand, material, season, gender, style, SKU, pricing, stock levels
- **Smart Pricing**: Base prices with brand and material multipliers, sale pricing support
- **Stock Management**: Min stock thresholds, automatic status tracking
- **Advanced Filtering**: Multi-criteria search and filtering capabilities

### **Data Generation**
- **500+ Fashion Items**: Automatically generated realistic inventory data
- **30+ Fashion Brands**: From luxury (Gucci, Prada) to affordable (H&M, Zara)
- **40+ Colors & Materials**: Comprehensive color palette and material options
- **Dynamic Pricing**: Brand-based price adjustments (luxury brands 2.5x, fast fashion 0.8x)
- **Realistic Stock Levels**: Randomized inventory with low stock alerts

### **Frontend Management**
- **Amazon-Style Interface**: Clean, professional inventory management dashboard
- **Advanced Search**: Search by product name, brand, category, color, or tags
- **Multi-Filter System**: Category, brand, gender, season, price range filtering
- **Sortable Columns**: Click headers to sort by any field
- **Pagination**: Efficient handling of large datasets
- **Real-time Stats**: Total items, categories, brands, low stock alerts
- **Stock Status Indicators**: Visual alerts for out of stock and low stock items

## 🚀 **Quick Start**

### **1. Generate Inventory Data**
```bash
# Using Python script
python generate_inventory.py

# Or use batch file (Windows)
generate_inventory.bat
```

### **2. Access Inventory Management**
Navigate to `/admin/inventory` in your application

## 📋 **Generated Data Summary**

### **Categories (15 types)**
- **Tops**: T-shirts, shirts, polos, tank tops, hoodies, sweaters, cardigans
- **Bottoms**: Pants, jeans, shorts, skirts
- **Outerwear**: Jackets, coats, blazers
- **Dresses**: Various dress styles

### **Brands (30+ brands)**
- **Luxury**: Gucci, Prada, Versace, Tom Ford, Burberry
- **Mid-Range**: Ralph Lauren, Calvin Klein, Tommy Hilfiger
- **Fast Fashion**: Zara, H&M, Forever 21, Urban Outfitters
- **Athletic**: Nike, Adidas, Lululemon, Athleta
- **Sustainable**: Patagonia, Everlane, Reformation

### **Pricing Structure**
- **Base Prices**: Rs.299 - Rs.19,999 depending on category
- **Luxury Multiplier**: 2.5x for high-end brands
- **Fast Fashion Multiplier**: 0.8x for affordable brands
- **Material Premium**: 1.3x for premium materials (cashmere, silk, leather)

### **Stock Management**
- **Random Stock Levels**: 0-200 units per item
- **Min Stock Thresholds**: 5-20 units
- **Status Tracking**: In Stock, Low Stock, Out of Stock
- **30% Sale Items**: Random sale pricing at 70% of original

## 🎨 **Frontend Features**

### **Dashboard Stats**
- Total inventory items
- Active categories count
- Brand diversity
- Low stock alerts

### **Search & Filter**
- **Real-time Search**: Product names, brands, colors, tags
- **Category Filter**: Filter by any of the 15 categories
- **Brand Filter**: Top 10 brands with quick selection
- **Gender Filter**: Men, Women, Unisex options
- **Season Filter**: Spring, Summer, Fall, Winter, All-season
- **Price Range**: Min/max price filtering
- **Advanced Filters**: Collapsible filter panel

### **Table Management**
- **Sortable Columns**: Click headers to sort ascending/descending
- **Product Cards**: Visual category icons and product images
- **Stock Status**: Color-coded badges (green/yellow/red)
- **Quick Actions**: View, Edit, Delete buttons
- **Pagination**: Navigate through large datasets efficiently

### **Visual Design**
- **Category Icons**: Unique icons for each clothing category
- **Stock Indicators**: Visual alerts for inventory issues
- **Price Display**: Regular and sale pricing
- **Responsive Layout**: Works on desktop, tablet, and mobile

## 📊 **Database Schema**

### **Enhanced Inventory Model**
```typescript
interface IInventory {
  productName: string;
  category: "tshirt" | "shirt" | "pants" | "jeans" | "dress" | "jacket" | "hoodie" | "sweater" | "shorts" | "skirt" | "blazer" | "coat" | "polo" | "tanktop" | "cardigan";
  subcategory?: string;
  brand: string;
  size: string;
  color: string;
  material: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  minStock: number;
  season: "spring" | "summer" | "fall" | "winter" | "all";
  gender: "men" | "women" | "unisex";
  style?: string;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
}
```

## 🔧 **API Endpoints**

### **GET /api/inventory**
- **Query Parameters**: page, limit, category, brand, gender, season, minPrice, maxPrice, search, sortBy, sortOrder
- **Response**: Paginated inventory items with filter options
- **Authentication**: Admin/Warehouse roles required

### **POST /api/inventory**
- **Body**: Inventory item data
- **Response**: Created item with unique SKU
- **Authentication**: Admin role required

### **PUT /api/inventory**
- **Body**: productId, stock
- **Response**: Updated inventory item
- **Authentication**: Warehouse role required

## 📈 **Sample Generated Data**

### **Example Items**
```
1. Gucci Crew Neck Black Tshirt - Rs.4,997 (Luxury brand)
2. Zara Skinny Blue Jeans - Rs.4,799 (Fast fashion)
3. Patagonia Fleece Green Hoodie - Rs.3,247 (Sustainable brand)
4. Tommy Hilfiger Oxford White Shirt - Rs.4,499 (Mid-range)
5. Lululemon Align Black Leggings - Rs.3,899 (Athletic)
```

### **Statistics**
- **Total Items**: 529 fashion products
- **Total Value**: Rs.2,705,155
- **Categories**: 15 different types
- **Brands**: 30+ fashion brands
- **Low Stock Items**: ~15% of inventory

## 🎯 **Use Cases**

### **For Admins**
- Monitor overall inventory health
- Track low stock alerts
- Manage product pricing and sales
- View category and brand performance

### **For Warehouse Staff**
- Update stock levels in real-time
- Monitor reorder points
- Track inventory movements
- Manage stock alerts

### **For Business Analytics**
- Category performance analysis
- Brand comparison metrics
- Seasonal inventory planning
- Pricing strategy optimization

## 🔄 **Maintenance**

### **Regenerating Data**
```bash
# Clear and regenerate all inventory
python generate_inventory.py

# The script automatically:
# - Clears existing inventory
# - Generates 500-600 new items
# - Updates in batches of 100
# - Provides detailed statistics
```

### **Database Updates**
- Schema is designed for easy migration
- New categories can be added to the enum
- Brand list can be expanded in the generator
- Pricing rules can be adjusted in the script

## 🎉 **Benefits**

1. **Comprehensive Coverage**: 15 fashion categories covering all major clothing types
2. **Realistic Data**: Brand-appropriate pricing and material selections
3. **Scalable System**: Handles 500+ items efficiently with pagination
4. **Professional Interface**: Amazon-style management dashboard
5. **Smart Features**: Low stock alerts, search, filtering, sorting
6. **Easy Maintenance**: Simple regeneration and update processes

This inventory system provides a complete foundation for managing fashion clothing products with professional-grade features and realistic data!
