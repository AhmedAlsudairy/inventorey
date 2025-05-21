import Link from 'next/link'
import { getCategories, getProductStatusTypes } from '@/app/actions/product'
import ProductForm from '@/components/product/ProductForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  const categories = await getCategories()
    // Handle potential errors with status types and provide a fallback
  let statusTypes: Array<{ id: number; name: string }> = []
  try {
    statusTypes = await getProductStatusTypes()
  } catch (error) {
    console.error("Error fetching product status types:", error)
    // Continue with empty status types, the form will handle it
  }
  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        asChild
        className="mb-6"
      >
        <Link href="/dashboard/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
        <p className="text-muted-foreground">
          Add a new product to your inventory
        </p>
      </div>
      
      <ProductForm 
        categories={categories}
        statusTypes={statusTypes}
      />
    </div>
  )
}
