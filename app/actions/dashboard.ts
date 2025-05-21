'use server'

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export type LowStockProductType = {
  id: number;
  name: string;
  sku: string;
  totalQuantity: number;
  primaryUnit: string;
  threshold: number; // Assuming we have a threshold
};

export type RecentActivityType = {
  id: number;
  productName: string;
  transactionType: string;
  quantityChange: number;
  unit: string;
  timestamp: Date;
  reason: string | null;
  userId: string;
};

// Get low stock items (currently just returning items with quantity < 10)
// In a real system, we would compare against a minimum stock level
export async function getLowStockAlerts(limit = 5) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get inventory items with low stock
    const inventoryItems = await db.inventory.findMany({
      where: {
        quantity: {
          lt: 10, // Example threshold, would be better to store per-product
        },
      },
      include: {
        product: true,
      },
      take: limit,
    });

    const lowStockProducts = inventoryItems.map(item => ({
      id: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      totalQuantity: item.quantity,
      primaryUnit: item.unit,
      threshold: 10, // Example threshold
    }));

    return { success: true, data: lowStockProducts };
  } catch (error) {
    console.error('Failed to get low stock alerts:', error);
    return { success: false, error: 'Failed to get low stock alerts' };
  }
}

// Get recent inventory transactions
export async function getRecentActivity(limit = 10) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const recentTransactions = await db.inventoryTransaction.findMany({
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    const activities = recentTransactions.map(transaction => ({
      id: transaction.id,
      productName: transaction.inventory.product.name,
      transactionType: transaction.transactionType,
      quantityChange: transaction.quantityChange,
      unit: transaction.unit,
      timestamp: transaction.timestamp,
      reason: transaction.reason,
      userId: transaction.userId,
    }));

    return { success: true, data: activities };
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    return { success: false, error: 'Failed to get recent activity' };
  }
}

// Get basic inventory metrics for dashboard
export async function getInventoryMetrics() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Total inventory value (we would need price info for this)
    // For now, counting items
    const totalInventoryItems = await db.inventory.count();
    
    // Total unique products in inventory
    const uniqueProducts = await db.inventory.groupBy({
      by: ['productId'],
    });
    
    // Total warehouses with inventory
    const uniqueWarehouses = await db.inventory.findMany({
      select: {
        shelf: {
          select: {
            rack: {
              select: {
                warehouseId: true,
              },
            },
          },
        },
      },
      distinct: ['shelfId'],
    });
    
    const uniqueWarehouseIds = new Set(
      uniqueWarehouses.map(item => item.shelf.rack.warehouseId)
    );

    return { 
      success: true, 
      data: {
        totalInventoryItems,
        uniqueProductCount: uniqueProducts.length,
        warehousesWithInventory: uniqueWarehouseIds.size
      } 
    };
  } catch (error) {
    console.error('Failed to get inventory metrics:', error);
    return { success: false, error: 'Failed to get inventory metrics' };
  }
}
