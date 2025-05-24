import { Suspense } from 'react'
import Link from 'next/link'
import { getInventory } from '@/app/actions/inventory'
import InventoryTable from '@/components/inventory/InventoryTable'
import InventoryFilters from '@/components/inventory/InventoryFilters'
import { Button } from '@/components/ui/button'
import { Plus, PackageOpen } from 'lucide-react'

export type SearchParamsType = Promise<{
  productId?: string
  shelfId?: string
  rackId?: string
}>;

interface PageProps {
  searchParams: SearchParamsType
}

export default async function InventoryPage({
  searchParams
}: PageProps) {
  // Await and resolve the searchParams Promise
  const resolvedSearchParams = await searchParams
    // Convert IDs to numbers if provided
  const productId = resolvedSearchParams.productId
    ? parseInt(resolvedSearchParams.productId)
    : undefined
    
  const shelfId = resolvedSearchParams.shelfId
    ? parseInt(resolvedSearchParams.shelfId)
    : undefined
    
  const rackId = resolvedSearchParams.rackId
    ? parseInt(resolvedSearchParams.rackId)
    : undefined
    
  const inventory = await getInventory(productId, shelfId, rackId)
    
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product inventory across all warehouses
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Link>
        </Button>      </div>
        
      <InventoryFilters />
        
      <Suspense fallback={<div className="py-8 text-center">Loading inventory...</div>}>
        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3">
              <PackageOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No inventory</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Get started by adding products to your inventory
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/inventory/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Inventory
              </Link>
            </Button>
          </div>
        ) : (
          <InventoryTable inventory={inventory} />
        )}
      </Suspense>
    </div>
  )
}