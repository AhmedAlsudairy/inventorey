'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProduct, updateProduct } from '@/app/actions/product'
import { AlertCircle, Plus, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Prisma } from '@prisma/client'

interface Category {
  id: number
  name: string
}

interface StatusType {
  id: number
  name: string
}

interface DimensionsObject {
  length?: string | number
  width?: string | number
  height?: string | number
  weight?: string | number
  volume?: string | number
  [key: string]: string | number | undefined
}


interface ProductFormProps {
  categories: Category[]
  statusTypes?: StatusType[]
  initialData?: {
    id: number
    name: string
    description: string | null
    documentNo: string | null
    sku: string
    categoryId: number
    productType: string
    primaryUnit: string
    dimensions: Prisma.JsonValue | null
    specifications: Prisma.JsonValue | null
    statusId: number
    category?: { id: number, name: string }
    status?: { id: number, name: string }
    inventory?: unknown[]
  }
}

// Type guard to check if a value is a plain object
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default function ProductForm({
  categories,
  statusTypes = [], 
  initialData
}: ProductFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Extract dimensions from JsonValue
  const extractDimensions = (): DimensionsObject => {
    if (!initialData?.dimensions) return {}
    if (!isObject(initialData.dimensions)) return {}
    
    const dimensions: DimensionsObject = {}
    const dim = initialData.dimensions as Record<string, unknown>
    
    // Extract known dimension properties if they exist
    if ('length' in dim) dimensions.length = String(dim.length || '')
    if ('width' in dim) dimensions.width = String(dim.width || '')
    if ('height' in dim) dimensions.height = String(dim.height || '')
    if ('weight' in dim) dimensions.weight = String(dim.weight || '')
    if ('volume' in dim) dimensions.volume = String(dim.volume || '')
    
    return dimensions
  }
  
  const dimensions = extractDimensions()
  
  // Form field states
  const [formState, setFormState] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    documentNo: initialData?.documentNo || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId?.toString() || '',
    productType: initialData?.productType || 'permanent',
    primaryUnit: initialData?.primaryUnit || 'ea',
    statusId: initialData?.statusId?.toString() || '',
    // Adding dimensions
    length: dimensions.length || '',
    width: dimensions.width || '',
    height: dimensions.height || '',
    weight: dimensions.weight || '',
    volume: dimensions.volume || ''
  })

  // Handle form field changes
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  // Specifications management
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')

  useEffect(() => {
    if (!initialData?.specifications) return
    
    // Handle specifications
    if (isObject(initialData.specifications)) {
      const initialSpecs = Object.entries(initialData.specifications).map(
        ([key, value]) => ({ key, value: String(value) })
      )
      setSpecs(initialSpecs)
    }
  }, [initialData])

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs([...specs, { key: newSpecKey, value: newSpecValue }])
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }
  
  const removeSpecification = (index: number) => {
    const newSpecs = [...specs]
    newSpecs.splice(index, 1)
    setSpecs(newSpecs)
  }
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
      
    // Use the formState directly instead of getting values from DOM elements
    const finalFormState = { ...formState }
    
    // Ensure required fields have values
    if (!finalFormState.name.trim()) {
      finalFormState.name = 'New Product'
    }
    
    // Set unique default SKU if not provided
    if (!finalFormState.sku.trim()) {
      // Generate a unique SKU using timestamp to avoid conflicts
      const timestamp = Date.now().toString().slice(-6)
      const defaultSku = `SKU${timestamp}`
      finalFormState.sku = defaultSku
      // Also update the form state to maintain consistency
      setFormState(prev => ({ ...prev, sku: defaultSku }))
    }
    
    // Create FormData from our state
    const formData = new FormData()
    
    // Add all form fields to formData
    Object.entries(finalFormState).forEach(([key, value]) => {
      // Skip empty values for optional fields
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value))
      }
    })
    
    // Add specifications to form data
    specs.forEach(spec => {
      formData.append(`spec_${spec.key}`, spec.value)
    })
      
    try {
      const result = initialData 
        ? await updateProduct(initialData.id, formData)
        : await createProduct(formData)
      
      if (result.success) {
        // Set loading state to show feedback before redirecting
        setLoading(true)
        
        // Only reset for new products, not updates
        if (!initialData) {
          try {
            // Safely check if form is still available
            if (event.currentTarget && typeof event.currentTarget.reset === 'function') {
              event.currentTarget.reset()
            }
          } catch (err) {
            console.error('Form reset error:', err)
            setError('Failed to reset form. Please try again.')
          }
        }
        
        // Short timeout to show success UI feedback
        setTimeout(() => {
          router.push('/dashboard/products')
          router.refresh()
        }, 500)
      } else {
        setError(result.error || 'An error occurred')
        setLoading(false)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">              
              <div className="col-span-2">
                <Label htmlFor="name">Product Name*</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                  value={formState.name}
                  onChange={handleFieldChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="Enter SKU (optional)"
                  value={formState.sku}
                  onChange={handleFieldChange}
                />
              </div>
              
              <div>
                <Label htmlFor="documentNo">Document Number</Label>
                <Input
                  id="documentNo"
                  name="documentNo"
                  placeholder="Enter document number"
                  value={formState.documentNo}
                  onChange={handleFieldChange}
                />
              </div>
              
              <div>
                <Label htmlFor="categoryId">Category*</Label>
                <Select 
                  name="categoryId" 
                  value={formState.categoryId}
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="statusId">Status*</Label>
                <Select 
                  name="statusId"
                  value={formState.statusId}
                  onValueChange={(value) => handleSelectChange('statusId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTypes && statusTypes.length > 0 ? (
                      statusTypes.map((status) => (
                        <SelectItem key={status.id} value={String(status.id)}>
                          {status.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="1">Default</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter product description"
                  rows={4}
                  value={formState.description}
                  onChange={handleFieldChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productType">Product Type*</Label>
                <Select 
                  name="productType" 
                  value={formState.productType}
                  onValueChange={(value) => handleSelectChange('productType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="primaryUnit">Primary Unit*</Label>
                <Select 
                  name="primaryUnit" 
                  value={formState.primaryUnit}
                  onValueChange={(value) => handleSelectChange('primaryUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ea">Each</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="g">Gram</SelectItem>
                    <SelectItem value="lb">Pound</SelectItem>
                    <SelectItem value="l">Liter</SelectItem>
                    <SelectItem value="ml">Milliliter</SelectItem>
                    <SelectItem value="m">Meter</SelectItem>
                    <SelectItem value="cm">Centimeter</SelectItem>
                    <SelectItem value="m2">Square Meter</SelectItem>
                    <SelectItem value="m3">Cubic Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <h3 className="font-medium mb-2">Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.01"
                      placeholder="Length"
                      value={formState.length}
                      onChange={handleFieldChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      placeholder="Width"
                      value={formState.width}
                      onChange={handleFieldChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.01"
                      placeholder="Height"
                      value={formState.height}
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  placeholder="Weight"
                  value={formState.weight}
                  onChange={handleFieldChange}
                />
              </div>
              
              <div>
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  name="volume"
                  type="number"
                  step="0.01"
                  placeholder="Volume"
                  value={formState.volume}
                  onChange={handleFieldChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="specs">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Specifications</h3>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                  <div>
                    <Label htmlFor="newSpecKey">Key</Label>
                    <Input
                      id="newSpecKey"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="e.g. Color"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newSpecValue">Value</Label>
                    <Input
                      id="newSpecValue"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="e.g. Blue"
                    />
                  </div>
                  <Button type="button" onClick={addSpecification} variant="secondary">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              {specs.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 font-medium">Key</th>
                        <th className="text-left p-2 font-medium">Value</th>
                        <th className="p-2 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {specs.map((spec, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{spec.key}</td>
                          <td className="p-2">{spec.value}</td>
                          <td className="p-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpecification(index)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No specifications added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard/products')}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {initialData ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>
  )
}
