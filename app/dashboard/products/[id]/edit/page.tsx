import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getCategories, getProductStatusTypes } from '@/app/actions/product'
import ProductForm from '@/components/product/ProductForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export type ParamsType = Promise<{ id: string }>;

interface PageProps {
  params: ParamsType
}

export default async function EditProductPage({ params }: PageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  if (isNaN(id)) {
    return notFound()
  }
  
  try {
    const [product, categories, statusTypes] = await Promise.all([
      getProduct(id),
      getCategories(),
      getProductStatusTypes(),
    ])
    
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          asChild
          className="mb-6"
        >
          <Link href={`/dashboard/products/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product Details
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product information
          </p>
        </div>
        
        <ProductForm 
          initialData={product}
          categories={categories}
          statusTypes={statusTypes}
        />
      </div>
    )
  } catch (error) {
    console.log(error)
    return notFound()
  }
}