'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteInventory(inventoryId: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    // First check if the inventory exists and get its details
    const inventory = await db.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        product: true,
        shelf: {
          select: {
            id: true,
            rackId: true,
            rack: {
              select: {
                warehouseId: true
              }
            }
          }
        }
      }
    })
    
    if (!inventory) {
      throw new Error('Inventory not found')
    }

    // Execute operations within a transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
      // First, delete all transactions related to this inventory
      await tx.inventoryTransaction.deleteMany({
        where: { inventoryId: inventoryId }
      });

      // Then delete the inventory record itself
      await tx.inventory.delete({
        where: { id: inventoryId }
      });

      return { success: true };
    });
    
    // Revalidate all relevant paths
    revalidatePath('/dashboard/inventory');
      // If the inventory was on a shelf, revalidate those paths as well
    if (inventory.shelf) {
      revalidatePath(`/dashboard/shelves/${inventory.shelf.id}`);
      revalidatePath(`/dashboard/racks/${inventory.shelf.rackId}`);
      if (inventory.shelf.rack?.warehouseId) {
        revalidatePath(`/dashboard/warehouses/${inventory.shelf.rack.warehouseId}`);
      }
    }
    
    return result;
  } catch (error: Error | unknown) {
    console.error('Error deleting inventory:', error)
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete inventory' 
    }
  }
}