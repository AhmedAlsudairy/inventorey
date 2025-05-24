'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProduct } from '@/app/actions/product'
import { AlertCircle, Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Category {
  id: number
  name: string
}

interface StatusType {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  sku: string
  primaryUnit: string
}

interface ProductModalProps {
  categories: Category[]
  statusTypes?: StatusType[]
  isOpen: boolean
  onClose: () => void
  onProductCreated: (product: Product) => void
}

export default function ProductModal({
  categories,
  statusTypes = [],
  isOpen,
  onClose,
  onProductCreated
}: ProductModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [success, setSuccess] = useState(false)
  
  // Form field states
  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    documentNo: '',
    description: '',
    categoryId: '',
    productType: 'permanent',
    primaryUnit: 'ea',
    statusId: statusTypes.length > 0 ? statusTypes[0].id.toString() : '1', // Default to first status or ID 1
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
      volume: ''
    },
    specifications: {
      brand: '',
      model: '',
      color: '',
      material: '',
      customSpec1: '',
      customSpec2: '',
      customSpec3: ''
    }
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormState({
        name: '',
        sku: '',
        documentNo: '',
        description: '',
        categoryId: '',
        productType: 'permanent',
        primaryUnit: 'ea',
        statusId: statusTypes.length > 0 ? statusTypes[0].id.toString() : '1',
        dimensions: {
          length: '',
          width: '',
          height: '',
          weight: '',
          volume: ''
        },
        specifications: {
          brand: '',
          model: '',
          color: '',
          material: '',
          customSpec1: '',
          customSpec2: '',
          customSpec3: ''
        }
      })
      setError(null)
      setLoading(false)
      setSuccess(false)
      setActiveTab('basic')
    }
  }, [isOpen, statusTypes])
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(event.currentTarget)
    
    // Handle SKU default value if not provided
    const skuValue = formData.get('sku') as string
    if (!skuValue || !skuValue.trim()) {
      // Generate a unique SKU using timestamp to avoid conflicts
      const timestamp = Date.now().toString().slice(-6)
      const defaultSku = `SKU${timestamp}`
      formData.set('sku', defaultSku)
      // Also update the form state to maintain consistency
      setFormState(prev => ({ ...prev, sku: defaultSku }))
    }
    
    try {
      const result = await createProduct(formData)
      
      if (result.success && result.product) {
        setSuccess(true)
        
        // Create the product object to pass back
        const newProduct: Product = {
          id: result.product.id,
          name: result.product.name,
          sku: result.product.sku,
          primaryUnit: result.product.primaryUnit
        }
        
        // Call the callback with the new product
        onProductCreated(newProduct)
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        setError(result.error || 'An error occurred while creating the product')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const updateFormState = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateDimensions = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value
      }
    }))
  }

  const updateSpecifications = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Create a new product to add to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-500 text-green-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Product created successfully!</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter product name"
                        value={formState.name}
                        onChange={(e) => updateFormState('name', e.target.value)}
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
                        onChange={(e) => updateFormState('sku', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentNo">Document Number</Label>
                      <Input
                        id="documentNo"
                        name="documentNo"
                        placeholder="Enter document number"
                        value={formState.documentNo}
                        onChange={(e) => updateFormState('documentNo', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="categoryId">Category*</Label>
                      <input type="hidden" name="categoryId" value={formState.categoryId} />
                      <Select
                        value={formState.categoryId}
                        onValueChange={(value) => updateFormState('categoryId', value)}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productType">Product Type*</Label>
                      <input type="hidden" name="productType" value={formState.productType} />
                      <Select
                        value={formState.productType}
                        onValueChange={(value) => updateFormState('productType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent">Permanent</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="primaryUnit">Primary Unit*</Label>
                      <input type="hidden" name="primaryUnit" value={formState.primaryUnit} />
                      <Select
                        value={formState.primaryUnit}
                        onValueChange={(value) => updateFormState('primaryUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary unit" />
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
                  </div>

                  {statusTypes.length > 0 && (
                    <div>
                      <Label htmlFor="statusId">Status*</Label>
                      <input type="hidden" name="statusId" value={formState.statusId} />
                      <Select
                        value={formState.statusId}
                        onValueChange={(value) => updateFormState('statusId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusTypes.map((status) => (
                            <SelectItem key={status.id} value={String(status.id)}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter product description"
                      value={formState.description}
                      onChange={(e) => updateFormState('description', e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dimensions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        name="length"
                        placeholder="Length"
                        value={formState.dimensions.length}
                        onChange={(e) => updateDimensions('length', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        name="width"
                        placeholder="Width"
                        value={formState.dimensions.width}
                        onChange={(e) => updateDimensions('width', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        name="height"
                        placeholder="Height"
                        value={formState.dimensions.height}
                        onChange={(e) => updateDimensions('height', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        name="weight"
                        placeholder="Weight"
                        value={formState.dimensions.weight}
                        onChange={(e) => updateDimensions('weight', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="volume">Volume</Label>
                      <Input
                        id="volume"
                        name="volume"
                        placeholder="Volume"
                        value={formState.dimensions.volume}
                        onChange={(e) => updateDimensions('volume', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        placeholder="Brand"
                        value={formState.specifications.brand}
                        onChange={(e) => updateSpecifications('brand', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        name="model"
                        placeholder="Model"
                        value={formState.specifications.model}
                        onChange={(e) => updateSpecifications('model', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        name="color"
                        placeholder="Color"
                        value={formState.specifications.color}
                        onChange={(e) => updateSpecifications('color', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        name="material"
                        placeholder="Material"
                        value={formState.specifications.material}
                        onChange={(e) => updateSpecifications('material', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customSpec1">Custom Specification 1</Label>
                      <Input
                        id="customSpec1"
                        name="customSpec1"
                        placeholder="Custom specification"
                        value={formState.specifications.customSpec1}
                        onChange={(e) => updateSpecifications('customSpec1', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customSpec2">Custom Specification 2</Label>
                      <Input
                        id="customSpec2"
                        name="customSpec2"
                        placeholder="Custom specification"
                        value={formState.specifications.customSpec2}
                        onChange={(e) => updateSpecifications('customSpec2', e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="customSpec3">Custom Specification 3</Label>
                      <Input
                        id="customSpec3"
                        name="customSpec3"
                        placeholder="Custom specification"
                        value={formState.specifications.customSpec3}
                        onChange={(e) => updateSpecifications('customSpec3', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
