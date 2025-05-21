import { Suspense } from 'react'
import Link from 'next/link'
import { getCategories } from '@/app/actions/category'
import CategoryTable from '@/components/category/CategoryTable'
import { Button } from '@/components/ui/button'
import { Plus, FolderTree } from 'lucide-react'

export type ParamsType = Promise<{ id?: string }>;
export type SearchParamsType = Promise<{ parentId?: string }>;

interface PageProps {
  params: ParamsType,
  searchParams: SearchParamsType
}

export default async function CategoriesPage({
  searchParams
}: PageProps) {
  // Await the resolved searchParams
  const resolvedSearchParams = await searchParams
  
  // Convert parentId to number if provided
  const parentId = resolvedSearchParams?.parentId 
    ? parseInt(resolvedSearchParams.parentId) 
    : undefined
  
  const categories = await getCategories(parentId)
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">
            Organize your products with categories
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<div className="py-8 text-center">Loading categories...</div>}>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No categories</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Get started by creating your first product category
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Link>
            </Button>
          </div>
        ) : (
          <CategoryTable categories={categories} />
        )}
      </Suspense>
    </div>
  )
}