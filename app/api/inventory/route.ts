import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["admin", "warehouse"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const season = searchParams.get('season');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build filter
    const filter: any = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (brand && brand !== 'all') {
      filter.brand = brand;
    }
    
    if (gender && gender !== 'all') {
      filter.gender = gender;
    }
    
    if (season && season !== 'all') {
      filter.season = season;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get total count
    const total = await Inventory.countDocuments(filter);
    
    // Get items
    const items = await Inventory.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Get filter options
    const categories = await Inventory.distinct('category');
    const brands = await Inventory.distinct('brand');
    const genders = await Inventory.distinct('gender');
    const seasons = await Inventory.distinct('season');
    
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        brands,
        genders,
        seasons
      }
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    
    // Check if SKU already exists
    const existingItem = await Inventory.findOne({ sku: body.sku });
    if (existingItem) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
    }
    
    const item = await Inventory.create(body);
    
    return NextResponse.json({ 
      message: "Inventory item created successfully", 
      item 
    }, { status: 201 });
  } catch (error) {
    console.error("Inventory creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      error: "Failed to create inventory item", 
      details: errorMessage
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "warehouse") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { productId, stock } = await req.json();
    const item = await Inventory.findOneAndUpdate(
      { productName: productId },
      { stock },
      { new: true }
    );

    return NextResponse.json({ inventory: item });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
