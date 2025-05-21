'use server'

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export type InventoryValueReportType = {
  id: number;
  name: string;
  sku: string;
  category: string;
  totalQuantity: number;
  unit: string;
  estimatedValue: number; // Assuming we're storing or calculating value
};

export type CategoryValueReportType = {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalItems: number;
  totalValue: number;
  percentage: number;
};

export type LocationValueReportType = {
  warehouseId: number;
  warehouseName: string;
  productCount: number;
  totalItems: number;
  totalValue: number;
  percentage: number;
};

// For now, we'll use a fixed average value per product for reports
// In a real system, each product would have its own cost/price
const DEFAULT_PRICE = 50; // Default price for calculating value

// Get inventory value report grouped by product
export async function getInventoryValueByProduct() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get inventory items with values
    const inventoryItems = await db.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by product and calculate total quantities and values
    const productMap = new Map();
    
    inventoryItems.forEach(item => {
      const productId = item.productId;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          name: item.product.name,
          sku: item.product.sku,
          category: item.product.category.name,
          totalQuantity: 0,
          unit: item.unit,
          estimatedValue: 0,
        });
      }
      
      const product = productMap.get(productId);
      product.totalQuantity += item.quantity;
      // For now using a fixed value per unit, in a real system would use product price
      product.estimatedValue += item.quantity * DEFAULT_PRICE;
    });

    return { 
      success: true, 
      data: Array.from(productMap.values()),
    };
  } catch (error) {
    console.error('Failed to get inventory value by product:', error);
    return { success: false, error: 'Failed to get inventory value by product' };
  }
}

// Get inventory value report grouped by category
export async function getInventoryValueByCategory() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get inventory items with values
    const inventoryItems = await db.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category and calculate total quantities and values
    const categoryMap = new Map();
    let totalValue = 0;
    
    inventoryItems.forEach(item => {
      const categoryId = item.product.categoryId;
      const categoryName = item.product.category.name;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          productCount: 0,
          totalItems: 0,
          totalValue: 0,
          percentage: 0,
        });
      }
      
      const category = categoryMap.get(categoryId);
      
      // Count unique products
      if (!category.products) {
        category.products = new Set();
      }
      category.products.add(item.productId);
      
      category.totalItems += item.quantity;
      const itemValue = item.quantity * DEFAULT_PRICE;
      category.totalValue += itemValue;
      totalValue += itemValue;
    });
    
    // Calculate percentages and prepare final data
    const result = Array.from(categoryMap.values()).map(category => {
      const { products, ...rest } = category;
      return {
        ...rest,
        productCount: products.size,
        percentage: totalValue > 0 ? (category.totalValue / totalValue) * 100 : 0,
      };
    });
    
    return { 
      success: true, 
      data: result,
      totalValue,
    };
  } catch (error) {
    console.error('Failed to get inventory value by category:', error);
    return { success: false, error: 'Failed to get inventory value by category' };
  }
}

// Get inventory value report grouped by warehouse location
export async function getInventoryValueByLocation() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get inventory items with warehouse information
    const inventoryItems = await db.inventory.findMany({
      include: {
        shelf: {
          include: {
            rack: {
              include: {
                warehouse: true,
              },
            },
          },
        },
        product: true,
      },
    });

    // Group by warehouse and calculate values
    const warehouseMap = new Map();
    let totalValue = 0;
    
    inventoryItems.forEach(item => {
      const warehouseId = item.shelf.rack.warehouse.id;
      const warehouseName = item.shelf.rack.warehouse.name;
      
      if (!warehouseMap.has(warehouseId)) {
        warehouseMap.set(warehouseId, {
          warehouseId,
          warehouseName,
          productCount: 0,
          totalItems: 0,
          totalValue: 0,
          percentage: 0,
        });
      }
      
      const warehouse = warehouseMap.get(warehouseId);
      
      // Count unique products
      if (!warehouse.products) {
        warehouse.products = new Set();
      }
      warehouse.products.add(item.productId);
      
      warehouse.totalItems += item.quantity;
      const itemValue = item.quantity * DEFAULT_PRICE;
      warehouse.totalValue += itemValue;
      totalValue += itemValue;
    });
    
    // Calculate percentages and prepare final data
    const result = Array.from(warehouseMap.values()).map(warehouse => {
      const { products, ...rest } = warehouse;
      return {
        ...rest,
        productCount: products.size,
        percentage: totalValue > 0 ? (warehouse.totalValue / totalValue) * 100 : 0,
      };
    });
    
    return { 
      success: true, 
      data: result,
      totalValue,
    };
  } catch (error) {
    console.error('Failed to get inventory value by location:', error);
    return { success: false, error: 'Failed to get inventory value by location' };
  }
}
