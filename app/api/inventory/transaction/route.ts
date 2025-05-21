// app/api/inventory/transaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { transactionSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body against schema
    const validatedData = transactionSchema.parse(body);
    
    const { 
      inventoryId, 
      transactionType, 
      quantityChange, 
      unit, 
      reason, 
      documentReference 
    } = validatedData;

    // Get current inventory
    const inventory = await db.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' }, 
        { status: 404 }
      );
    }

    const quantityBefore = inventory.quantity;
    
    // Calculate new quantity based on transaction type
    let quantityAfter: number;
    
    switch (transactionType) {
      case 'add':
        quantityAfter = quantityBefore + quantityChange;
        break;
      case 'remove':
        quantityAfter = quantityBefore - quantityChange;
        if (quantityAfter < 0) {
          return NextResponse.json(
            { error: 'Cannot remove more than available quantity' }, 
            { status: 400 }
          );
        }
        break;
      case 'adjust':
        quantityAfter = quantityChange; // Direct set to the new value
        break;
      case 'transfer':
        // Transfer should be handled separately as it involves two inventory records
        return NextResponse.json(
          { error: 'Transfer transactions should use the transfer API endpoint' }, 
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: 'Invalid transaction type' }, 
          { status: 400 }
        );
    }

    // Create transaction in a transaction (for atomicity)
    const result = await db.$transaction([
      db.inventoryTransaction.create({
        data: {
          inventoryId,
          transactionType,
          quantityBefore,
          quantityChange: transactionType === 'remove' ? -quantityChange : quantityChange,
          quantityAfter,
          unit,
          reason: reason || '',
          documentReference: documentReference || '',
          userId,
          timestamp: new Date(),
        },
      }),
      db.inventory.update({
        where: { id: inventoryId },
        data: { quantity: quantityAfter },
      }),
    ]);

    return NextResponse.json({ success: true, data: result[0] });  } catch (error: unknown) {
    console.error('Failed to process inventory transaction:', error);
    
    // Handle validation errors
    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      const zodError = error as { errors?: unknown };
      return NextResponse.json(
        { error: 'Validation error', details: zodError.errors }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process transaction' }, 
      { status: 500 }
    );
  }
}
