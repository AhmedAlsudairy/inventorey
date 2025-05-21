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

    // Create a record in the inventory transaction table to log the deletion
    await db.inventoryTransaction.create({
      data: {
        inventoryId: inventoryId,
        transactionType: 'DELETE',
        quantityBefore: inventory.quantity,
        quantityChange: -inventory.quantity, // Negative change to represent removal
        quantityAfter: 0,
        unit: inventory.unit,
        reason: 'Inventory deleted',
        userId: userId
      }
    })    // Delete the inventory record
    await db.inventory.delete({
      where: { id: inventoryId }
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
    
    return { success: true }
  } catch (error: Error | unknown) {
    console.error('Error deleting inventory:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete inventory' 
    }
  }
}