'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createStatus, updateStatus } from '@/app/actions/status'

interface StatusFormProps {
  initialData?: {
    id: number
    code: string
    name: string
    entityType: string
  }
}

const ENTITY_TYPES = [
  { id: 'product', name: 'Product' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'rack', name: 'Rack' },
  { id: 'shelf', name: 'Shelf' },
]

export default function StatusForm({ initialData }: StatusFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    entityType: initialData?.entityType || ''
  })
  
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('code', formData.code)
      formDataToSubmit.append('name', formData.name)
      formDataToSubmit.append('entityType', formData.entityType)

      if (initialData) {
        // Update existing status
        formDataToSubmit.append('id', initialData.id.toString())
        await updateStatus(formDataToSubmit)
      } else {
        // Create new status
        await createStatus(formDataToSubmit)
        
        // Reset form for new status only, not updates
        try {
          // Reset form state
          setFormData({
            code: '',
            name: '',
            entityType: 'product'
          })
        } catch (err) {
          console.error('Form reset error:', err)
        }
      }
      
      router.push('/dashboard/status')
      router.refresh()
    } catch (err) {
      console.error('Error submitting status:', err)
      setError('Failed to save status. Please check the form and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">Status Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="Enter status code"
                required
              />
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="name">Status Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter status name"
                required
              />
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select
                value={formData.entityType}
                onValueChange={(value) => handleChange('entityType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="ml-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : initialData ? 'Update Status' : 'Create Status'}
        </Button>
      </div>
    </form>
  )
}
