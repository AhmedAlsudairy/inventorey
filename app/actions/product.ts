'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { productSchema } from '@/lib/schemas';
import { Prisma } from '@prisma/client';

export async function createProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  try {
    // Extract and validate dimensions if present
    let dimensions: Prisma.JsonValue | undefined = undefined;
    if (formData.get('length') || formData.get('width') || formData.get('height') || 
        formData.get('weight') || formData.get('volume')) {
      dimensions = {
        length: formData.get('length') ? Number(formData.get('length')) : undefined,
        width: formData.get('width') ? Number(formData.get('width')) : undefined,
        height: formData.get('height') ? Number(formData.get('height')) : undefined,
        weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
        volume: formData.get('volume') ? Number(formData.get('volume')) : undefined,
      };
    }

    // Extract specifications if any are provided
    const specKeys = Array.from(formData.keys()).filter(key => key.startsWith('spec_'));
    let specifications: Prisma.JsonValue | undefined = undefined;
    if (specKeys.length > 0) {
      specifications = {};
      for (const key of specKeys) {
        const specName = key.replace('spec_', '');
        const specValue = formData.get(key);
        if (specifications && typeof specifications === 'object') {
          (specifications as Record<string, string | null>)[specName] = specValue instanceof File ? specValue.name : specValue?.toString() || null;
        }
      }
    }

    // Ensure required fields have default values if missing
    const name = formData.get('name')?.toString() || 'New Product';
    const sku = formData.get('sku')?.toString() || '';
    const productType = formData.get('productType')?.toString() || 'permanent';
    const primaryUnit = formData.get('primaryUnit')?.toString() || 'unit';
    const categoryId = formData.get('categoryId') ? Number(formData.get('categoryId')) : 1;
    const statusId = formData.get('statusId') ? Number(formData.get('statusId')) : 1;

    const validated = productSchema.parse({
      name,
      description: formData.get('description')?.toString() || undefined,
      documentNo: formData.get('documentNo')?.toString() || undefined,
      sku,
      categoryId,
      productType: productType as "permanent" | "consumable",
      primaryUnit,
      dimensions,
      specifications,
      statusId,
    });

    await db.product.create({
      data: {
        name: validated.name,
        description: validated.description,
        documentNo: validated.documentNo,
        sku: validated.sku,
        categoryId: validated.categoryId,
        productType: validated.productType,
        primaryUnit: validated.primaryUnit,
        dimensions: validated.dimensions,
        specifications: validated.specifications,
        statusId: validated.statusId,
      },
    });
    
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create product' };
  }
}

export async function getProducts(categoryId?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const whereClause = categoryId ? { categoryId } : undefined;
      return await db.product.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        status: {
          select: {
            name: true,
          },
        },
        inventory: {
          select: {
            quantity: true,
            unit: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function getProduct(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
          },
        },
        inventory: {
          include: {
            shelf: {
              include: {
                rack: {
                  include: {
                    warehouse: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    return product;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    throw error;
  }
}

export async function updateProduct(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  // Extract and validate dimensions if present
  let dimensions: Prisma.JsonValue | undefined = undefined;
  if (formData.get('length') || formData.get('width') || formData.get('height') || 
      formData.get('weight') || formData.get('volume')) {
    dimensions = {
      length: formData.get('length') ? Number(formData.get('length')) : undefined,
      width: formData.get('width') ? Number(formData.get('width')) : undefined,
      height: formData.get('height') ? Number(formData.get('height')) : undefined,
      weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
      volume: formData.get('volume') ? Number(formData.get('volume')) : undefined,
    };
  }

  // Extract specifications if any are provided
  const specKeys = Array.from(formData.keys()).filter(key => key.startsWith('spec_'));
  let specifications: Prisma.JsonValue | undefined = undefined;
  if (specKeys.length > 0) {
    specifications = {};
    for (const key of specKeys) {
      const specName = key.replace('spec_', '');
      const specValue = formData.get(key);
      if (specifications && typeof specifications === 'object') {
        (specifications as Record<string, string | null>)[specName] = specValue instanceof File ? specValue.name : specValue?.toString() || null;
      }
    }
  }
  
  // Add validation to ensure required fields have values
  const name = formData.get('name')?.toString() || '';
  const sku = formData.get('sku')?.toString() || '';
  const productType = formData.get('productType')?.toString() || 'permanent';
  const primaryUnit = formData.get('primaryUnit')?.toString() || '';
  const categoryId = formData.get('categoryId') ? Number(formData.get('categoryId')) : 0;

  try {
    const validated = productSchema.parse({
      name: name,
      description: formData.get('description')?.toString() || undefined,
      documentNo: formData.get('documentNo')?.toString() || undefined,
      sku: sku,
      categoryId: categoryId,
      productType: productType as "permanent" | "consumable",
      primaryUnit: primaryUnit,
      dimensions,
      specifications,
      statusId: formData.get('statusId') ? Number(formData.get('statusId')) : 1,
    });

    await db.product.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        documentNo: validated.documentNo,
        sku: validated.sku,
        categoryId: validated.categoryId,
        productType: validated.productType,
        primaryUnit: validated.primaryUnit,
        dimensions: validated.dimensions,
        specifications: validated.specifications,
        statusId: validated.statusId,
      },
    });
    
    revalidatePath('/dashboard/products');
    revalidatePath(`/dashboard/products/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  const id = Number(formData.get('id'));
  if (!id) {
    return { success: false, error: 'Product ID is required' };
  }
  
  try {
    // Check if product has any inventory records
    const inventoryCount = await db.inventory.count({
      where: { productId: id },
    });
    
    if (inventoryCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete product. It has ${inventoryCount} inventory records.` 
      };
    }
      // Use a transaction to ensure atomicity
    await db.$transaction(async (tx) => {
      // Delete the product
      await tx.product.delete({
        where: { id },
      });
    });
    
    // Revalidate both the products list and product detail pages
    revalidatePath('/dashboard/products');
    revalidatePath(`/dashboard/products/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: 'Failed to delete product' };
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

export async function getProductStatusTypes(): Promise<Array<{ id: number; name: string; code?: string; entityType?: string }>> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    const statusTypes = await db.statusType.findMany({
      where: {
        entityType: 'product',
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // If no status types are found, create a default one
    if (statusTypes.length === 0) {
      try {
        const defaultStatus = await db.statusType.create({
          data: {
            code: 'ACT',
            name: 'Active',
            entityType: 'product',
          }
        });
        return [defaultStatus];
      } catch (createError) {
        console.error('Failed to create default status:', createError);
        // Continue and return empty array if creation fails
      }
    }
    
    return statusTypes;
  } catch (error) {
    console.error('Failed to fetch product status types:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}
