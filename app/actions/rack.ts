// app/actions/rack.ts
'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { rackSchema } from '@/lib/schemas';

export async function createRack(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  // Validate the input
  const warehouseId = Number(formData.get('warehouseId'));
  if (!warehouseId) {
    throw new Error("Warehouse ID is required");
  }

  // Extract dimensions, handling optional values
  const dimensions = {
    height: formData.has('height') ? Number(formData.get('height')) : undefined,
    width: formData.has('width') ? Number(formData.get('width')) : undefined,
    depth: formData.has('depth') ? Number(formData.get('depth')) : undefined,
  };

  const validated = rackSchema.parse({
    warehouseId,
    rackCode: formData.get('rackCode'),
    location: formData.get('location'),
    numShelves: Number(formData.get('numShelves')),
    dimensions,
    status: Number(formData.get('status')),
  });

  try {
    await db.rack.create({
      data: {
        warehouseId: validated.warehouseId,
        rackCode: validated.rackCode,
        location: validated.location,
        numShelves: validated.numShelves,
        dimensions: validated.dimensions,
        status: validated.status,
      },
    });
    
    revalidatePath(`/dashboard/warehouses/${warehouseId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create rack:', error);
    return { success: false, error: 'Failed to create rack' };
  }
}

export async function getRacks(warehouseId?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const whereClause = warehouseId ? { warehouseId } : undefined;
    
    return await db.rack.findMany({
      where: whereClause,
      orderBy: {
        rackCode: 'asc',
      },
      include: {
        warehouse: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            shelves: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch racks:', error);
    throw new Error('Failed to fetch racks');
  }
}

export async function getRack(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.rack.findUnique({
      where: { id },
      include: {
        warehouse: true,
        shelves: {
          include: {
            _count: {
              select: {
                inventory: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch rack with id ${id}:`, error);
    throw new Error('Failed to fetch rack');
  }
}

export async function updateRack(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const dimensions = {
    height: formData.has('height') ? Number(formData.get('height')) : undefined,
    width: formData.has('width') ? Number(formData.get('width')) : undefined,
    depth: formData.has('depth') ? Number(formData.get('depth')) : undefined,
  };

  const validated = rackSchema.parse({
    warehouseId: Number(formData.get('warehouseId')),
    rackCode: formData.get('rackCode'),
    location: formData.get('location'),
    numShelves: Number(formData.get('numShelves')),
    dimensions,
    status: Number(formData.get('status')),
  });

  try {
    await db.rack.update({
      where: { id },
      data: {
        warehouseId: validated.warehouseId,
        rackCode: validated.rackCode,
        location: validated.location,
        numShelves: validated.numShelves,
        dimensions: validated.dimensions,
        status: validated.status,
      },
    });
    
    revalidatePath(`/dashboard/warehouses/${validated.warehouseId}`);
    revalidatePath(`/dashboard/racks/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update rack:', error);
    return { success: false, error: 'Failed to update rack' };
  }
}

export async function deleteRack(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const id = Number(formData.get('id'));
  const warehouseId = Number(formData.get('warehouseId'));
  
  if (!id) {
    return { success: false, error: 'Invalid rack ID' };
  }

  try {
    // Check if rack has shelves
    const rackWithShelves = await db.rack.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shelves: true,
          },
        },
      },
    });

    if (rackWithShelves?._count.shelves && rackWithShelves._count.shelves > 0) {
      return { 
        success: false, 
        error: 'Cannot delete rack with existing shelves. Please remove all shelves first.' 
      };
    }

    await db.rack.delete({
      where: { id },
    });
    
    revalidatePath(`/dashboard/warehouses/${warehouseId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete rack:', error);
    return { success: false, error: 'Failed to delete rack' };
  }
}
