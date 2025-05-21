'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { deleteInventory } from '@/app/actions/inventory/deleteInventory';
import { getInventoryItem } from '@/app/actions/inventory/getInventoryItem';

interface InventoryItemDetail {
  id: number;
  quantity: number;
  unit: string;
  batchNumber: string | null;
  expiryDate: string | Date | null;
  product: {
    id: number;
    name: string;
    sku: string;
  };  
  shelf?: {
    id: number;
    shelfCode: string;
    rack?: {
      id: number;
      rackCode: string;
      warehouse?: {
        id: number;
        name: string;
        location: string;
        status: string;
      };
    };
  };
  transactions?: Array<{
    id: number;
    userId: string;
    unit: string;
    inventoryId: number;
    transactionType: string;
    quantityBefore: number;
    quantityChange: number;
    quantityAfter: number;
    reason: string | null;
    documentReference: string | null;
    timestamp: Date;
  }>;
}

export default function DeleteInventoryPage() {  
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inventoryItem, setInventoryItem] = useState<InventoryItemDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventoryItem() {
      setIsLoading(true);
      try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
          throw new Error("Invalid inventory ID");
        }
        
        const item = await getInventoryItem(id);
        if (!item) {
          throw new Error("Inventory item not found");
        }
        
        setInventoryItem(item);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory item");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInventoryItem();
  }, [params.id]);

  const handleDelete = async () => {
    if (!inventoryItem) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteInventory(inventoryItem.id);
      if (result.success) {
        // If this was accessed from a shelf page, return to that
        if (inventoryItem.shelf?.id) {
          router.push(`/dashboard/shelves/${inventoryItem.shelf.id}`);
        } else {
          // Otherwise go to main inventory page
          router.push('/dashboard/inventory');
        }
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to delete inventory");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete inventory");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    // If this was accessed from a shelf page, return to that
    if (inventoryItem?.shelf?.id) {
      router.push(`/dashboard/shelves/${inventoryItem.shelf.id}`);
    } else {
      // Otherwise go to inventory page or go back
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load inventory item</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!inventoryItem) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Delete Inventory</h1>
      
      <Card>
        <CardHeader className="bg-destructive/5">
          <CardTitle>Are you sure you want to delete this inventory?</CardTitle>
          <CardDescription>
            This action cannot be undone. This will permanently delete the inventory record.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-1">
              <h3 className="font-medium">Product</h3>
              <p>{inventoryItem.product.name} ({inventoryItem.product.sku})</p>
            </div>
            
            <div className="grid gap-1">
              <h3 className="font-medium">Quantity</h3>
              <p>{inventoryItem.quantity} {inventoryItem.unit}</p>
            </div>
            
            <div className="grid gap-1">
              <h3 className="font-medium">Location</h3>
              <p>
                {inventoryItem.shelf?.rack?.warehouse?.name || 'N/A'} &gt; {' '}
                {inventoryItem.shelf?.rack?.rackCode || 'N/A'} &gt; {' '}
                {inventoryItem.shelf?.shelfCode || 'N/A'}
              </p>
            </div>
            
            {inventoryItem.batchNumber && (
              <div className="grid gap-1">
                <h3 className="font-medium">Batch Number</h3>
                <p>{inventoryItem.batchNumber}</p>
              </div>
            )}
            
            {inventoryItem.expiryDate && (
              <div className="grid gap-1">
                <h3 className="font-medium">Expiry Date</h3>
                <p>{new Date(inventoryItem.expiryDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : 'Delete Inventory'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
