import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategory, getCategories } from '@/app/actions/category'
import CategoryForm from '@/components/category/CategoryForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export type ParamsType = Promise<{ id: string }>;


export default async function EditCategoryPage( { params }: { params: ParamsType } ) {
  const id = parseInt((await params).id)
    if (isNaN(id)) {
    return notFound()
  }
  
  try {
    const [category, allCategories] = await Promise.all([
      getCategory(id),
      getCategories()
    ])
    
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          asChild
          className="mb-6"
        >
          <Link href="/dashboard/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update category information
          </p>
        </div>
        
        <CategoryForm 
          initialData={category}
          categories={allCategories}
        />
      </div>
    )  } catch (error) {
    console.error("Error fetching category data:", error);
    return notFound();
  }
}
