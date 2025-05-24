'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategories } from '@/app/actions/category'
import { X } from 'lucide-react'

interface Category {
  id: number
  name: string
}

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('categoryId') || 'all'
  )

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    loadCategories()
  }, [])
  const updateFilters = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categoryId && categoryId !== 'all') {
      params.set('categoryId', categoryId)
    } else {
      params.delete('categoryId')
    }

    router.push(`/dashboard/products?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    updateFilters(value)
  }
  const clearFilters = () => {
    setSelectedCategory('all')
    router.push('/dashboard/products')
  }

  const hasActiveFilters = selectedCategory && selectedCategory !== 'all'

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Clear filters
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
