// app/api/inventory/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLowStockAlerts } from '@/app/actions/dashboard';

export async function GET(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters (limit and format)
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit')) || 20; // Default to 20 if not provided
    const format = url.searchParams.get('format') || 'json'; // Default to JSON
    
    // Get low stock alerts using the server action
    const result = await getLowStockAlerts(limit);
    
    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Failed to get low stock alerts' }, { status: 500 });
    }
    
    const lowStockItems = result.data;
    
    // For non-json format (e.g. CSV), implement format conversion here
    if (format === 'csv') {
      // Convert to CSV format
      const header = 'id,name,sku,quantity,threshold,unit\n';
      const rows = lowStockItems.map(item => 
        `${item.id},${item.name},${item.sku},${item.totalQuantity},${item.threshold},${item.primaryUnit}`
      ).join('\n');
      const csv = header + rows;
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="low-stock-alerts.csv"'
        }
      });
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      data: lowStockItems,
      count: lowStockItems.length,
    });
  } catch (error) {
    console.error('Failed to fetch low stock alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
