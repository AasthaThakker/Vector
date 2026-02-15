import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import Order from "@/models/Order";

export async function GET() {
    try {
        await connectDB();

        // Fetch last 5 recent returns with limited fields
        const recentReturns = await Return.find({})
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('status updatedAt reason returnMethod productId orderId') // select minimal fields
            .populate('orderId', 'products'); // to get product details

        const activities = recentReturns.map((ret: any) => {
            // Find product name if possible
            let productName = "Item";
            if (ret.orderId && ret.orderId.products) {
                const product = ret.orderId.products.find((p: any) => p.productId === ret.productId);
                if (product) productName = product.name;
            }

            // Map status to user-friendly action text and color
            let action = "Return Updated";
            let statusColor = "blue";

            switch (ret.status) {
                case 'approved':
                    action = "Return Approved";
                    statusColor = "blue";
                    break;
                case 'pickup_scheduled':
                    action = "Pickup Scheduled";
                    statusColor = "amber";
                    break;
                case 'completed':
                    action = "Refund Processed";
                    statusColor = "emerald";
                    break;
                case 'pending':
                    action = "New Return Request";
                    statusColor = "blue";
                    break;
                case 'rejected':
                    action = "Return Rejected";
                    statusColor = "red";
                    break;
                default:
                    action = `Status: ${ret.status.replace('_', ' ')}`;
            }

            // Calculate relative time (e.g., "2m ago")
            const now = new Date();
            const updated = new Date(ret.updatedAt);
            const diffMs = now.getTime() - updated.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeText = "Just now";
            if (diffDays > 0) timeText = `${diffDays}d ago`;
            else if (diffHours > 0) timeText = `${diffHours}h ago`;
            else if (diffMins > 0) timeText = `${diffMins}m ago`;

            return {
                action,
                item: productName,
                time: timeText,
                status: statusColor
            };
        });

        // If no activities (fresh DB), return some "System Ready" state or empty
        // But for demo purposes, if empty, we might return an empty list and handle it in frontend

        return NextResponse.json({ activities });

    } catch (error) {
        console.error("Recent returns fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
