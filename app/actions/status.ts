'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const statusSchema = z.object({
  code: z.string().min(1, "Status code is required"),
  name: z.string().min(1, "Status name is required"),
  entityType: z.string().min(1, "Entity type is required"),
});

export async function getStatusTypes() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.statusType.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error("Failed to fetch status types:", error);
    return [];
  }
}

export async function getStatusTypeById(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.statusType.findUnique({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.error(`Failed to fetch status type with ID ${id}:`, error);
    return null;
  }
}

export async function getStatusTypesByEntity(entityType: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    return await db.statusType.findMany({
      where: {
        entityType: entityType,
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error(`Failed to fetch status types for entity ${entityType}:`, error);
    return [];
  }
}

export async function createStatus(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const validated = statusSchema.parse({
      code: formData.get('code'),
      name: formData.get('name'),
      entityType: formData.get('entityType'),
    });
    
    const statusType = await db.statusType.create({
      data: {
        code: validated.code,
        name: validated.name,
        entityType: validated.entityType,
      },
    });
    
    revalidatePath('/dashboard/status');
    revalidatePath(`/dashboard/status/${statusType.id}`);
    return { success: true, data: statusType };
  } catch (error) {
    console.error("Failed to create status:", error);
    return { success: false, error: "Failed to create status" };
  }
}

export async function updateStatus(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const id = Number(formData.get('id'));
    const validated = statusSchema.parse({
      code: formData.get('code'),
      name: formData.get('name'),
      entityType: formData.get('entityType'),
    });
    
    const statusType = await db.statusType.update({
      where: {
        id: id,
      },
      data: {
        code: validated.code,
        name: validated.name,
        entityType: validated.entityType,
      },
    });
    
    revalidatePath('/dashboard/status');
    revalidatePath(`/dashboard/status/${id}`);
    return { success: true, data: statusType };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteStatus(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    // Check if this status is used by any products
    const productsUsingStatus = await db.product.count({
      where: {
        statusId: id,
      },
    });
    
    if (productsUsingStatus > 0) {
      return { 
        success: false, 
        error: `This status is being used by ${productsUsingStatus} product(s) and cannot be deleted.` 
      };
    }
    
    await db.statusType.delete({
      where: {
        id: id,
      },
    });
    
    revalidatePath('/dashboard/status');
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete status with ID ${id}:`, error);
    return { success: false, error: "Failed to delete status" };
  }
}
