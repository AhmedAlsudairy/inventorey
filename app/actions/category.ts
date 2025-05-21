'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { categorySchema } from '@/lib/schemas';

export async function createCategory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  // Extract parentId if it exists
  const parentIdValue = formData.get('parentId');
  let parentId = undefined;
  if (parentIdValue && parentIdValue !== 'no-parent') {
    parentId = Number(parentIdValue);
    if (parentId === 0) parentId = undefined;
  }

  // Extract active status
  const active = formData.get('active') === 'on';

  const validated = categorySchema.parse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    parentId,
    active,
  });

  try {
    await db.category.create({
      data: {
        name: validated.name,
        description: validated.description,
        parentId: validated.parentId,
        active: validated.active,
      },
    });
    
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function getCategories(parentId?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const whereClause = parentId !== undefined 
      ? { parentId: parentId === 0 ? null : parentId } 
      : undefined;
    
    return await db.category.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}

export async function getCategory(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        subcategories: {
          select: {
            id: true,
            name: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
          take: 10,
        },
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
      },
    });
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    return category;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
    // Extract parentId if it exists
  const parentIdValue = formData.get('parentId');
  let parentId = null;
  if (parentIdValue && parentIdValue !== 'no-parent') {
    parentId = Number(parentIdValue);
    if (parentId === 0) parentId = null;
  }

  // Extract active status
  const active = formData.get('active') === 'on';

  // Check if trying to set itself as parent
  if (parentId === id) {
    return { success: false, error: 'A category cannot be its own parent' };
  }

  const validated = categorySchema.parse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    parentId,
    active,
  });

  try {
    // Check if the selected parent is a descendant of this category
    if (parentId) {
      // Function to check if a category is a descendant
      async function isDescendant(categoryId: number, potentialDescendantId: number): Promise<boolean> {
        // Base case: they're the same
        if (categoryId === potentialDescendantId) return true;
        
        // Get all immediate children of the potential descendant
        const children = await db.category.findMany({
          where: { parentId: potentialDescendantId },
          select: { id: true }
        });
        
        // Check each child recursively
        for (const child of children) {
          if (await isDescendant(categoryId, child.id)) return true;
        }
        
        return false;
      }
      
      // Check if parentId is a descendant of id
      const descendantCheck = await isDescendant(id, parentId);
      if (descendantCheck) {
        return { 
          success: false, 
          error: 'Cannot set a subcategory as the parent (circular reference)' 
        };
      }
    }

    await db.category.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        parentId: validated.parentId,
        active: validated.active,
      },
    });
    
    revalidatePath('/dashboard/categories');
    revalidatePath(`/dashboard/categories/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  const id = Number(formData.get('id'));
  if (!id) {
    return { success: false, error: 'Category ID is required' };
  }
  
  try {
    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId: id },
    });
    
    if (productCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete category. It has ${productCount} associated products.` 
      };
    }
    
    // Check if category has subcategories
    const subcategoryCount = await db.category.count({
      where: { parentId: id },
    });
    
    if (subcategoryCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete category. It has ${subcategoryCount} subcategories.` 
      };
    }
    
    await db.category.delete({
      where: { id },
    });
    
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
