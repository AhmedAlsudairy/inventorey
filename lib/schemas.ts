// lib/schemas.ts
import { z } from 'zod';

// Warehouse schemas
export const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  status: z.string(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

// Rack schemas
export const rackSchema = z.object({
  warehouseId: z.number(),
  rackCode: z.string().min(1, "Rack code is required"),
  location: z.string().min(1, "Location is required"),
  numShelves: z.number().min(1, "Number of shelves is required"),
  dimensions: z.object({
    height: z.number(),
    width: z.number(),
    depth: z.number(),
  }),
  status: z.number(),
});

export type RackFormValues = z.infer<typeof rackSchema>;

// Shelf schemas
export const shelfSchema = z.object({
  rackId: z.number(),
  shelfCode: z.string().min(1, "Shelf code is required"),
  position: z.string().min(1, "Position is required"),
  dimensions: z.object({
    height: z.number(),
    width: z.number(),
    depth: z.number(),
  }),
  capacityKg: z.number().min(0, "Capacity must be non-negative"),
  status: z.number(),
});

export type ShelfFormValues = z.infer<typeof shelfSchema>;

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.number().optional(),
  active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, "Name is required").default("New Product"),
  description: z.string().optional(),
  documentNo: z.string().optional(),
  sku: z.string().optional().default(""),
  categoryId: z.number(),
  productType: z.enum(["permanent", "consumable"], {
    required_error: "Product type is required",
    invalid_type_error: "Product type must be 'permanent' or 'consumable'",
  }),
  primaryUnit: z.string().min(1, "Primary unit is required"),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
  }).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  statusId: z.number().optional().default(1),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Inventory schemas
export const inventorySchema = z.object({
  productId: z.number(),
  shelfId: z.number(),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unit: z.string().min(1, "Unit is required"),
  batchNumber: z.string().optional(),
  expiryDate: z.date().optional(),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;

// Transaction schemas
export const transactionSchema = z.object({
  inventoryId: z.number(),
  transactionType: z.enum(['add', 'remove', 'transfer', 'adjust']),
  quantityChange: z.number(),
  unit: z.string(),
  reason: z.string().optional(),
  documentReference: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
