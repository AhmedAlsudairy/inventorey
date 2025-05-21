'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { inventorySchema } from '@/lib/schemas';


export async function addInventory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const validated = inventorySchema.parse({
    productId: Number(formData.get('productId')),
    shelfId: Number(formData.get('shelfId')),
    quantity: Number(formData.get('quantity')),
    unit: formData.get('unit'),
    batchNumber: formData.get('batchNumber') || undefined,
    expiryDate: formData.get('expiryDate') 
      ? new Date(formData.get('expiryDate') as string) 
      : undefined,
  });

  try {
    // Check if there's existing inventory for this product on this shelf
    const existingInventory = await db.inventory.findFirst({
      where: {
        productId: validated.productId,
        shelfId: validated.shelfId,
        batchNumber: validated.batchNumber || null,
      },
    });

    let inventoryRecord;
    
    if (existingInventory) {
      // Update existing inventory
      const newQuantity = existingInventory.quantity + validated.quantity;
      
      inventoryRecord = await db.inventory.update({
        where: { id: existingInventory.id },
        data: { 
          quantity: newQuantity,
          expiryDate: validated.expiryDate,
        },
      });
      
      // Create transaction record for audit trail
      await db.inventoryTransaction.create({
        data: {
          inventoryId: existingInventory.id,
          transactionType: 'add',
          quantityBefore: existingInventory.quantity,
          quantityChange: validated.quantity,
          quantityAfter: newQuantity,
          unit: validated.unit,
          reason: formData.get('reason') as string || 'Manual addition',
          documentReference: formData.get('documentReference') as string || null,
          userId,
        },
      });
      
    } else {
      // Create new inventory record
      inventoryRecord = await db.inventory.create({
        data: {
          productId: validated.productId,
          shelfId: validated.shelfId,
          quantity: validated.quantity,
          unit: validated.unit,
          batchNumber: validated.batchNumber,
          expiryDate: validated.expiryDate,
        },
      });
      
      // Create transaction record for audit trail
      await db.inventoryTransaction.create({
        data: {
          inventoryId: inventoryRecord.id,
          transactionType: 'initial',
          quantityBefore: 0,
          quantityChange: validated.quantity,
          quantityAfter: validated.quantity,
          unit: validated.unit,
          reason: formData.get('reason') as string || 'Initial inventory',
          documentReference: formData.get('documentReference') as string || null,
          userId,
        },
      });
    }
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/inventory');
    revalidatePath(`/dashboard/products/${validated.productId}`);
    return { success: true };
    
  } catch (error) {
    console.error('Failed to add inventory:', error);
    return { success: false, error: 'Failed to add inventory' };
  }
}

export async function getInventory(productId?: number, shelfId?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const whereClause: { productId?: number, shelfId?: number } = {};
    
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

export async function getInventoryDetail(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {    const inventory = await db.inventory.findUnique({
      where: { id },
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
        transactions: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 100,
        },
      },
    });
    
    if (!inventory) {
      throw new Error("Inventory record not found");
    }
    
    return inventory;
  } catch (error) {
    console.error('Failed to fetch inventory detail:', error);
    throw error;
  }
}

export async function adjustInventory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const inventoryId = Number(formData.get('inventoryId'));
  if (!inventoryId) {
    return { success: false, error: 'Inventory ID is required' };
  }
  
  const transactionType = formData.get('transactionType') as 'add' | 'remove' | 'adjust';
  const quantityChange = Number(formData.get('quantityChange'));
  
  if (isNaN(quantityChange) || quantityChange <= 0) {
    return { 
      success: false, 
      error: 'Quantity must be a positive number' 
    };
  }

  try {
    // Get current inventory
    const currentInventory = await db.inventory.findUnique({
      where: { id: inventoryId },
    });
    
    if (!currentInventory) {
      return { success: false, error: 'Inventory record not found' };
    }
    
    // Calculate new quantity based on transaction type
    let newQuantity: number;
    
    if (transactionType === 'add') {
      newQuantity = currentInventory.quantity + quantityChange;
    } else if (transactionType === 'remove') {
      newQuantity = currentInventory.quantity - quantityChange;
      if (newQuantity < 0) {
        return { 
          success: false, 
          error: 'Cannot remove more than available quantity' 
        };
      }
    } else if (transactionType === 'adjust') {
      // Direct adjustment to a specific value
      newQuantity = quantityChange;
    } else {
      return { success: false, error: 'Invalid transaction type' };
    }
    
    // Update inventory
    await db.inventory.update({
      where: { id: inventoryId },
      data: { quantity: newQuantity },
    });
    
    // Create transaction record
    await db.inventoryTransaction.create({
      data: {
        inventoryId,
        transactionType,
        quantityBefore: currentInventory.quantity,
        quantityChange: 
          transactionType === 'adjust' 
            ? newQuantity - currentInventory.quantity 
            : quantityChange,
        quantityAfter: newQuantity,
        unit: currentInventory.unit,
        reason: formData.get('reason') as string || `Manual ${transactionType}`,
        documentReference: formData.get('documentReference') as string || null,
        userId,
      },
    });
    
    // Revalidate paths
    revalidatePath('/dashboard/inventory');
    revalidatePath(`/dashboard/inventory/${inventoryId}`);
    revalidatePath(`/dashboard/products/${currentInventory.productId}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('Failed to adjust inventory:', error);
    return { success: false, error: 'Failed to adjust inventory' };
  }
}

export async function transferInventory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const sourceInventoryId = Number(formData.get('sourceInventoryId'));
  const targetShelfId = Number(formData.get('targetShelfId'));
  const quantityToTransfer = Number(formData.get('quantity'));
  
  if (!sourceInventoryId || !targetShelfId || !quantityToTransfer) {
    return { 
      success: false, 
      error: 'Missing required fields for transfer' 
    };
  }

  if (quantityToTransfer <= 0) {
    return { 
      success: false, 
      error: 'Quantity must be a positive number' 
    };
  }

  try {
    // Get source inventory
    const sourceInventory = await db.inventory.findUnique({
      where: { id: sourceInventoryId },
    });
    
    if (!sourceInventory) {
      return { success: false, error: 'Source inventory not found' };
    }
    
    if (sourceInventory.quantity < quantityToTransfer) {
      return { 
        success: false, 
        error: 'Cannot transfer more than available quantity' 
      };
    }
    
    // Check if target shelf exists
    const targetShelf = await db.shelf.findUnique({
      where: { id: targetShelfId },
    });
    
    if (!targetShelf) {
      return { success: false, error: 'Target shelf not found' };
    }
    
    // Begin transaction
    const result = await db.$transaction(async (prisma) => {
      // Check for existing inventory on target shelf with same product and batch
      const existingTargetInventory = await prisma.inventory.findFirst({
        where: {
          productId: sourceInventory.productId,
          shelfId: targetShelfId,
          batchNumber: sourceInventory.batchNumber,
        },
      });
      
      // Update source inventory
      const updatedSourceQuantity = sourceInventory.quantity - quantityToTransfer;
      let sourceOperation;
      
      if (updatedSourceQuantity === 0) {
        // Delete if quantity becomes zero
        sourceOperation = prisma.inventory.delete({
          where: { id: sourceInventoryId },
        });
      } else {
        // Update with reduced quantity
        sourceOperation = prisma.inventory.update({
          where: { id: sourceInventoryId },
          data: { quantity: updatedSourceQuantity },
        });
      }
      
      await sourceOperation;
      
      // Create or update target inventory
      let targetInventoryId: number;
      
      if (existingTargetInventory) {
        // Update existing record on target shelf
        const updatedTarget = await prisma.inventory.update({
          where: { id: existingTargetInventory.id },
          data: { 
            quantity: existingTargetInventory.quantity + quantityToTransfer 
          },
        });
        targetInventoryId = updatedTarget.id;
      } else {
        // Create new inventory record on target shelf
        const newTarget = await prisma.inventory.create({
          data: {
            productId: sourceInventory.productId,
            shelfId: targetShelfId,
            quantity: quantityToTransfer,
            unit: sourceInventory.unit,
            batchNumber: sourceInventory.batchNumber,
            expiryDate: sourceInventory.expiryDate,
          },
        });
        targetInventoryId = newTarget.id;
      }
      
      // Create transaction records
      const reason = formData.get('reason') as string || 'Inventory transfer';
      const documentReference = formData.get('documentReference') as string || null;
      
      // Source transaction (removal)
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: sourceInventoryId,
          transactionType: 'transfer_out',
          quantityBefore: sourceInventory.quantity,
          quantityChange: -quantityToTransfer,
          quantityAfter: updatedSourceQuantity,
          unit: sourceInventory.unit,
          reason,
          documentReference,
          userId,
        },
      });
      
      // Target transaction (addition)
      const targetBeforeQuantity = existingTargetInventory?.quantity || 0;
      const targetAfterQuantity = targetBeforeQuantity + quantityToTransfer;
      
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: targetInventoryId,
          transactionType: 'transfer_in',
          quantityBefore: targetBeforeQuantity,
          quantityChange: quantityToTransfer,
          quantityAfter: targetAfterQuantity,
          unit: sourceInventory.unit,
          reason,
          documentReference,
          userId,
        },
      });
      
      return { sourceId: sourceInventoryId, targetId: targetInventoryId };
    });
    
    // Revalidate paths
    revalidatePath('/dashboard/inventory');
    revalidatePath(`/dashboard/inventory/${result.sourceId}`);
    revalidatePath(`/dashboard/inventory/${result.targetId}`);
    revalidatePath(`/dashboard/products/${sourceInventory.productId}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('Failed to transfer inventory:', error);
    return { success: false, error: 'Failed to transfer inventory' };
  }
}

export async function getInventoryTransactions(inventoryId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.inventoryTransaction.findMany({
      where: { inventoryId },
      orderBy: {
        timestamp: 'desc',
      },
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
}


export async function updateInventory(id: number, formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Not authenticated")
  }

  try {
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
    }

    // Validate form data
    const validated = inventorySchema.parse({
      productId: Number(formData.get('productId')),
      shelfId: Number(formData.get('shelfId')),
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit'),
      batchNumber: formData.get('batchNumber') || undefined,
      expiryDate: formData.get('expiryDate') 
        ? new Date(formData.get('expiryDate') as string) 
        : undefined,
    })

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
    })

    // Then update the inventory record
    await db.inventory.update({
      where: { id },
      data: {
        productId: validated.productId,
        shelfId: validated.shelfId,
        quantity: validated.quantity,
        unit: validated.unit,
        batchNumber: validated.batchNumber || null,
        expiryDate: validated.expiryDate || null,
      }
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: unknown) {
    console.error('Failed to update inventory:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update inventory';
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

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
    })
    
    // Delete the inventory record
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
  } catch (error) {
    console.error('Error deleting inventory:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete inventory' 
    }
  }
}
