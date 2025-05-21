// lib/hooks/useOptimisticInventory.ts
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Inventory {
  id: number;
  productId: number;
  shelfId: number;
  quantity: number;
  unit: string;
  batchNumber?: string | null;
  expiryDate?: Date | null;
}

export function useOptimisticInventory(initialInventory: Inventory) {
  const router = useRouter();
  const [inventory, setInventory] = useState<Inventory>(initialInventory);
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateQuantity(
    transactionType: string, 
    quantityChange: number, 
    reason?: string,
    documentReference?: string
  ) {
    // Apply optimistic update
    const quantityBefore = inventory.quantity;
    let quantityAfter: number;
    
    switch (transactionType) {
      case 'add':
        quantityAfter = quantityBefore + quantityChange;
        break;
      case 'remove':
        quantityAfter = quantityBefore - quantityChange;
        if (quantityAfter < 0) {
          toast.error('Cannot remove more than available quantity');
          return;
        }
        break;
      case 'adjust':
        quantityAfter = quantityChange; // Direct set to the new value
        break;
      default:
        toast.error('Invalid transaction type');
        return;
    }
    
    setInventory({
      ...inventory,
      quantity: quantityAfter,
    });
    
    setIsUpdating(true);
    
    try {
      // Make the actual API call
      const response = await fetch('/api/inventory/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventoryId: inventory.id,
          transactionType,
          quantityChange: transactionType === 'add' ? quantityChange : 
                          transactionType === 'remove' ? -quantityChange : 
                          quantityChange - quantityBefore, // For adjust
          unit: inventory.unit,
          reason,
          documentReference,
        }),
      });
      
      if (!response.ok) {
        // Revert optimistic update on error
        setInventory({
          ...inventory,
          quantity: quantityBefore,
        });
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update inventory');
      }
      
      // const data = await response.json();
      toast.success('Inventory updated successfully');
      
      // Refresh the page data but maintain current view
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }
  
  return {
    inventory,
    isUpdating,
    updateQuantity,
  };
}
