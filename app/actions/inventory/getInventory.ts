'use server'

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function getInventory(productId?: number, shelfId?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
    try {
    const whereClause: {
      productId?: number;
      shelfId?: number;
    } = {};
    
    if (productId !== undefined) {
      whereClause.productId = productId;
    }
    
    if (shelfId !== undefined) {
      whereClause.shelfId = shelfId;
    }
      
    return await db.inventory.findMany({
      where: whereClause,
      orderBy: [
        { product: { name: 'asc' } }
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            documentNo: true,
            productType: true,
            primaryUnit: true,
            category: {
              select: {
                name: true,
              }
            }
          }
        },
        shelf: {
          select: {
            id: true,
            shelfCode: true,
            rack: {
              select: {
                id: true,
                rackCode: true,
                warehouse: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    throw error;
  }
}
