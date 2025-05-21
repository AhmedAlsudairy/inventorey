import Link from 'next/link'
import { getProducts } from '@/app/actions/product'
import { getWarehousesWithRacksAndShelves } from '@/app/actions/warehouse'
import InventoryForm from '@/components/inventory/InventoryForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'


export type SearchParamsType = Promise<{ productId?: string }>;

interface PageProps {
  searchParams: SearchParamsType
}

export default async function NewInventoryPage({ 
  searchParams 
}: PageProps) {
  // Await and resolve the searchParams Promise
  const resolvedSearchParams = await searchParams
  
  // Get initial product ID if provided in query params
  const initialProductId = resolvedSearchParams.productId 
    ? parseInt(resolvedSearchParams.productId) 
    : undefined
  
  const [products, warehouses] = await Promise.all([
    getProducts(),
    getWarehousesWithRacksAndShelves(),
  ])
  
  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        asChild
        className="mb-6"
      >
        <Link href="/dashboard/inventory">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Link>
      </Button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add Inventory</h1>
        <p className="text-muted-foreground">
          Add products to your inventory
        </p>
      </div>
      
      <InventoryForm 
        products={products}
        warehouses={warehouses}
        initialProductId={initialProductId}
      />
    </div>
  )
}
