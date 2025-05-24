import { Suspense } from 'react'
import Link from 'next/link'
import { getProducts } from '@/app/actions/product'
import ProductTable from '@/components/product/ProductTable'
import ProductFilters from '@/components/products/ProductFilters'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'

export type SearchParamsType = Promise<{
  categoryId?: string
}>;

interface PageProps {
  searchParams: SearchParamsType
}

export default async function ProductsPage({
  searchParams
}: PageProps) {
  // Await and resolve the searchParams Promise
  const resolvedSearchParams = await searchParams
  
  // Get categoryId from searchParams
  const categoryIdParam = resolvedSearchParams?.categoryId
  
  // Convert categoryId to number if provided
  const categoryId = categoryIdParam
    ? parseInt(categoryIdParam)
    : undefined
  
  const products = await getProducts(categoryId)
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>      </div>
      
      <ProductFilters />
      
      <Suspense fallback={<div className="py-8 text-center">Loading products...</div>}>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No products</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Get started by creating your first product
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Link>
            </Button>
          </div>
        ) : (
          <ProductTable products={products} />
        )}
      </Suspense>
    </div>
  )
}
