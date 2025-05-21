'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCategory, updateCategory } from '@/app/actions/category'
import { AlertCircle, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Category {
  id: number
  name: string
}

interface CategoryFormProps {
  categories: Category[]
  initialData?: {
    id: number
    name: string
    description: string | null
    parentId: number | null
    active: boolean
  }
}

export default function CategoryForm({ 
  categories, 
  initialData 
}: CategoryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    
    try {
      const result = initialData 
        ? await updateCategory(initialData.id, formData)
        : await createCategory(formData)
      
      if (result.success) {
        // Only reset form for new categories, not updates
        if (!initialData) {
          try {
            // Safely check if form is still available
            if (event.currentTarget && typeof event.currentTarget.reset === 'function') {
              event.currentTarget.reset()
            }
          } catch (err) {
            console.error('Form reset error:', err)
          }
        }
        
        router.push('/dashboard/categories')
        router.refresh()
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="name">Category Name*</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              defaultValue={initialData?.name || ''}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter category description"
              rows={4}
              defaultValue={initialData?.description || ''}
            />
          </div>
          
          <div>
            <Label htmlFor="parentId">Parent Category</Label>            <Select 
              name="parentId" 
              defaultValue={
                initialData?.parentId 
                  ? String(initialData.parentId) 
                  : "no-parent"
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent category" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="no-parent">No parent category</SelectItem>
                {categories
                  .filter(cat => cat.id !== initialData?.id)
                  .map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="active" 
              name="active" 
              defaultChecked={initialData?.active !== false}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard/categories')}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {initialData ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  )
}
