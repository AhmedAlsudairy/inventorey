'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { inventorySchema } from '@/lib/schemas'

export async function updateInventory(id: number, formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Not authenticated")
  }
  try {
    // Debug: Log the incoming FormData
    console.log('UpdateInventory - FormData debug:', {
      productId: formData.get('productId'),
      shelfId: formData.get('shelfId'),
      quantity: formData.get('quantity'),
      unit: formData.get('unit'),
      position: formData.get('position'),
      batchNumber: formData.get('batchNumber'),
      expiryDate: formData.get('expiryDate')
    })

    // First, find the existing inventory item
    const existingInventory = await db.inventory.findUnique({
      where: { id },
      include: {
        product: true,
        shelf: {
          include: {
            rack: {
              include: {
                warehouse: true
              }
            }
          }
        }
      }
    })

    if (!existingInventory) {
      return { success: false, error: "Inventory not found" }
    }    // Validate form data
    const validated = inventorySchema.parse({
      productId: Number(formData.get('productId')),
      shelfId: Number(formData.get('shelfId')),
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit'),
      position: Number(formData.get('position')) || 0,
      batchNumber: formData.get('batchNumber') || undefined,
      expiryDate: formData.get('expiryDate') 
        ? new Date(formData.get('expiryDate') as string) 
        : undefined,
    })

    // Debug: Log the validated data
    console.log('UpdateInventory - Validated data:', validated)

    // Calculate the quantity change for the transaction record
    const quantityChange = validated.quantity - existingInventory.quantity
    
    // Create a transaction record first
    await db.inventoryTransaction.create({
      data: {
        inventoryId: id,
        transactionType: 'UPDATE',
        quantityBefore: existingInventory.quantity,
        quantityChange,
        quantityAfter: validated.quantity,
        unit: validated.unit,
        reason: formData.get('reason')?.toString() || 'Inventory updated',
        documentReference: formData.get('documentReference')?.toString() || null,
        userId: userId,
      }
    })    // Then update the inventory record
    const updatedInventory = await db.inventory.update({
      where: { id },
      data: {
        productId: validated.productId,
        shelfId: validated.shelfId,
        quantity: validated.quantity,
        unit: validated.unit,
        position: validated.position,
        batchNumber: validated.batchNumber || null,
        expiryDate: validated.expiryDate || null,      }
    })

    // Debug: Log the updated inventory
    console.log('UpdateInventory - Updated inventory:', {
      id: updatedInventory.id,
      position: updatedInventory.position,
      quantity: updatedInventory.quantity,
      unit: updatedInventory.unit
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: Error | unknown) {
    console.error('Failed to update inventory:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update inventory' 
    }
  }
}
