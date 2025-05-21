// app/actions/shelf.ts
'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { shelfSchema } from '@/lib/schemas';

export async function createShelf(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Validate the input
  const rackId = Number(formData.get('rackId'));
  if (!rackId) {
    throw new Error("Rack ID is required");
  }

  const dimensions = {
    height: Number(formData.get('height')),
    width: Number(formData.get('width')),
    depth: Number(formData.get('depth')),
  };

  const validated = shelfSchema.parse({
    rackId,
    shelfCode: formData.get('shelfCode'),
    position: formData.get('position'),
    dimensions,
    capacityKg: Number(formData.get('capacityKg')),
    status: Number(formData.get('status')),
  });

  try {
    // Get the rack to find its warehouse for path revalidation
    const rack = await db.rack.findUnique({
      where: { id: rackId },
      select: { warehouseId: true }
    });
    
    if (!rack) {
      throw new Error("Rack not found");
    }

    await db.shelf.create({
      data: {
        rackId: validated.rackId,
        shelfCode: validated.shelfCode,
        position: validated.position,
        dimensions: validated.dimensions,
        capacityKg: validated.capacityKg,
        status: validated.status,
      },
    });
    
    revalidatePath(`/dashboard/racks/${rackId}`);
    revalidatePath(`/dashboard/warehouses/${rack.warehouseId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create shelf:', error);
    return { success: false, error: 'Failed to create shelf' };
  }
}

export async function getShelves(rackId?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const whereClause = rackId ? { rackId } : undefined;
    
    return await db.shelf.findMany({
      where: whereClause,
      orderBy: {
        shelfCode: 'asc',
      },
      include: {
        rack: {
          select: {
            rackCode: true,
            warehouseId: true,
            warehouse: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            inventory: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch shelves:', error);
    throw new Error('Failed to fetch shelves');
  }
}

export async function getShelf(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.shelf.findUnique({
      where: { id },
      include: {
        rack: {
          include: {
            warehouse: true,
          },
        },        inventory: {
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
          },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch shelf with id ${id}:`, error);
    throw new Error('Failed to fetch shelf');
  }
}

export async function updateShelf(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const dimensions = {
    height: Number(formData.get('height')),
    width: Number(formData.get('width')),
    depth: Number(formData.get('depth')),
  };

  const validated = shelfSchema.parse({
    rackId: Number(formData.get('rackId')),
    shelfCode: formData.get('shelfCode'),
    position: formData.get('position'),
    dimensions,
    capacityKg: Number(formData.get('capacityKg')),
    status: Number(formData.get('status')),
  });

  try {
    // Get the rack to find its warehouse for path revalidation
    const rack = await db.rack.findUnique({
      where: { id: validated.rackId },
      select: { warehouseId: true }
    });
    
    if (!rack) {
      throw new Error("Rack not found");
    }

    await db.shelf.update({
      where: { id },
      data: {
        rackId: validated.rackId,
        shelfCode: validated.shelfCode,
        position: validated.position,
        dimensions: validated.dimensions,
        capacityKg: validated.capacityKg,
        status: validated.status,
      },
    });
    
    revalidatePath(`/dashboard/racks/${validated.rackId}`);
    revalidatePath(`/dashboard/shelves/${id}`);
    revalidatePath(`/dashboard/warehouses/${rack.warehouseId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update shelf:', error);
    return { success: false, error: 'Failed to update shelf' };
  }
}

export async function deleteShelf(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const id = Number(formData.get('id'));
  const rackId = Number(formData.get('rackId'));
  
  if (!id) {
    return { success: false, error: 'Invalid shelf ID' };
  }

  try {
    // Check if shelf has inventory items
    const shelfWithInventory = await db.shelf.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventory: true,
          },
        },
        rack: {
          select: {
            warehouseId: true,
          },
        },
      },
    });

    if (!shelfWithInventory) {
      return { success: false, error: 'Shelf not found' };
    }

    if (shelfWithInventory._count.inventory > 0) {
      return { 
        success: false, 
        error: 'Cannot delete shelf with existing inventory items. Please remove all inventory items first.' 
      };
    }

    await db.shelf.delete({
      where: { id },
    });
    
    revalidatePath(`/dashboard/racks/${rackId}`);
    revalidatePath(`/dashboard/warehouses/${shelfWithInventory.rack.warehouseId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete shelf:', error);
    return { success: false, error: 'Failed to delete shelf' };
  }
}
