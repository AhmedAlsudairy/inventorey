// app/actions/warehouse.ts
'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { warehouseSchema } from '@/lib/schemas';

export async function createWarehouse(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Validate the input
  const validated = warehouseSchema.parse({
    name: formData.get('name'),
    location: formData.get('location'),
    status: formData.get('status'),
  });

  try {
    await db.warehouse.create({
      data: {
        name: validated.name,
        location: validated.location,
        status: validated.status,
      },
    });
    
    revalidatePath('/dashboard/warehouses');
    return { success: true };
  } catch (error) {
    console.error('Failed to create warehouse:', error);
    return { success: false, error: 'Failed to create warehouse' };
  }
}

export async function getWarehouses() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.warehouse.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            racks: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    throw new Error('Failed to fetch warehouses');
  }
}

// getWarehousesWithRacksAndShelves implementation moved to line ~229

export async function getWarehouse(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.warehouse.findUnique({
      where: { id },
      include: {
        racks: {
          include: {
            shelves: {
              include: {
                _count: {
                  select: {
                    inventory: true,
                  },
                },
              },
            },
            _count: {
              select: {
                shelves: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch warehouse with id ${id}:`, error);
    throw new Error('Failed to fetch warehouse');
  }
}

export async function getAllWarehouses() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.warehouse.findMany({
      include: {
        racks: {
          include: {
            shelves: {
              select: {
                id: true,
                shelfCode: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Failed to fetch warehouses with racks and shelves:', error);
    throw new Error('Failed to fetch warehouses');
  }
}

export async function updateWarehouse(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Validate the input
  const validated = warehouseSchema.parse({
    name: formData.get('name'),
    location: formData.get('location'),
    status: formData.get('status'),
  });

  try {
    await db.warehouse.update({
      where: { id },
      data: {
        name: validated.name,
        location: validated.location,
        status: validated.status,
      },
    });
    
    revalidatePath('/dashboard/warehouses');
    revalidatePath(`/dashboard/warehouses/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update warehouse:', error);
    return { success: false, error: 'Failed to update warehouse' };
  }
}

export async function deleteWarehouse(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const id = Number(formData.get('id'));
  if (!id) {
    return { success: false, error: 'Invalid warehouse ID' };
  }

  try {
    // Check if warehouse has racks
    const warehouseWithRacks = await db.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            racks: true,
          },
        },
      },
    });

    if (warehouseWithRacks?._count.racks && warehouseWithRacks._count.racks > 0) {
      return { 
        success: false, 
        error: 'Cannot delete warehouse with existing racks. Please remove all racks first.' 
      };
    }

    await db.warehouse.delete({
      where: { id },
    });
    
    revalidatePath('/dashboard/warehouses');
    return { success: true };  } catch (error) {
    console.error('Failed to delete warehouse:', error);
    return { success: false, error: 'Failed to delete warehouse' };
  }
}

export async function getWarehousesWithRacksAndShelves() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.warehouse.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        name: 'asc',
      },      select: {
        id: true,
        name: true,
        racks: {
          where: {
            status: 1, // Assuming 1 is active
          },
          orderBy: {
            rackCode: 'asc',
          },
          select: {
            id: true,
            rackCode: true,
            shelves: {
              where: {
                status: 1, // Assuming 1 is active
              },
              orderBy: {
                shelfCode: 'asc',
              },
              select: {
                id: true,
                shelfCode: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch warehouses with racks and shelves:', error);
    throw error;
  }
}
