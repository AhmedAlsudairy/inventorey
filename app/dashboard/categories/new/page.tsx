import Link from 'next/link'
import { getCategories } from '@/app/actions/category'
import CategoryForm from '@/components/category/CategoryForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewCategoryPage() {
  const categories = await getCategories()
  
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
        <h1 className="text-2xl font-bold tracking-tight">New Category</h1>
        <p className="text-muted-foreground">
          Create a new product category
        </p>
      </div>
      
      <CategoryForm categories={categories} />
    </div>
  )
}
