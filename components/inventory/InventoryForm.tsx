'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { addInventory, updateInventory } from '@/app/actions/inventory'
import { AlertCircle, Check, Save, Search, Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ProductModal from '../product/ProductModal'

interface Product {
  id: number
  name: string
  sku: string
  primaryUnit: string
}

interface Category {
  id: number
  name: string
}

interface StatusType {
  id: number
  name: string
}

interface Warehouse {
  id: number
  name: string
  racks: Array<{
    id: number
    rackCode: string
    shelves: Array<{
      id: number
      shelfCode: string
    }>
  }>
}

interface InventoryFormProps {
  products: Product[]
  warehouses: Warehouse[]
  categories: Category[]
  statusTypes: StatusType[]
  initialProductId?: number
  initialData?: InventoryItem // For editing mode
  isEditing?: boolean
}

interface InventoryItem {
  id: number
  productId: number
  quantity: number
  unit: string
  shelfId: number
  position?: number
  expiryDate?: string | Date | null
  batchNumber?: string | null
  product: Product
  shelf: {
    id: number
    shelfCode: string
    rack: {
      id: number
      rackCode: string
      warehouse: {
        id: number
        name: string
      }
    }
  }
  transactions?: Array<{
    documentReference?: string | null
  }>
}

export default function InventoryForm({ 
  products, 
  warehouses,
  categories,
  statusTypes,
  initialProductId,
  initialData,
  isEditing = false
}: InventoryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
    // Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [currentProducts, setCurrentProducts] = useState<Product[]>(products)
  
  // Initialize state with values from initialData if in edit mode
  const [selectedProduct, setSelectedProduct] = useState<string>(
    isEditing && initialData ? String(initialData.productId) : ''
  )
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    isEditing && initialData ? String(initialData.shelf.rack.warehouse.id) : ''
  )
  const [selectedRack, setSelectedRack] = useState<string>(
    isEditing && initialData ? String(initialData.shelf.rack.id) : ''
  )
  const [selectedShelf, setSelectedShelf] = useState<string>(
    isEditing && initialData ? String(initialData.shelfId) : ''
  )
  const [selectedUnit, setSelectedUnit] = useState<string>(
    isEditing && initialData ? initialData.unit : ''
  )
  const [position, setPosition] = useState<number>(
    isEditing && initialData ? initialData.position || 0 : 0
  )

  // Debug: Log initial data and position
  useEffect(() => {
    console.log('InventoryForm - Initial data debug:', {
      isEditing,
      initialDataPosition: initialData?.position,
      positionState: position,
      initialData: initialData ? {
        id: initialData.id,
        position: initialData.position,
        quantity: initialData.quantity,
        unit: initialData.unit
      } : null
    })
  }, [isEditing, initialData, position])
  
  // Debug: Log position state changes
  useEffect(() => {
    console.log('Position state changed:', position)
  }, [position])
  
  // Debug: Log initial data on mount
  useEffect(() => {
    if (isEditing && initialData) {
      console.log('Initial data in edit mode:', {
        position: initialData.position,
        productId: initialData.productId,
        unit: initialData.unit
      })
    }
  }, [isEditing, initialData])
  
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(() => {
    if (isEditing && initialData && initialData.expiryDate) {
      // Handle both string and Date types for expiryDate
      return initialData.expiryDate instanceof Date 
        ? initialData.expiryDate 
        : new Date(initialData.expiryDate);
    }
    return undefined;
  })
  
  // Initialize rack options if we have initial data
  const initialRackOptions = isEditing && initialData && warehouses ? 
    warehouses.find(w => w.id === Number(initialData.shelf.rack.warehouse.id))?.racks || [] 
    : []
  
  // Initialize shelf options if we have initial data
  const initialShelfOptions = isEditing && initialData && initialRackOptions ? 
    initialRackOptions.find(r => r.id === Number(initialData.shelf.rack.id))?.shelves || [] 
    : []
  
  const [rackOptions, setRackOptions] = useState<Array<{ id: number; rackCode: string }>>(initialRackOptions)
  const [shelfOptions, setShelfOptions] = useState<Array<{ id: number; shelfCode: string }>>(initialShelfOptions)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(currentProducts)
  // Initialize with initial data if in editing mode, or initial product ID if provided
  useEffect(() => {
    console.log('InventoryForm init effect running with:', {
      warehouses,
      isEditing,
      hasInitialData: !!initialData
    })
    
    if (isEditing && initialData) {
      console.log('Initial data for edit:', initialData)
      console.log('Products available:', products)
      console.log('Product ID from initialData:', initialData.productId)
      console.log('Product from initialData:', initialData.product)
      console.log('Warehouse from initialData:', initialData.shelf?.rack?.warehouse)
      console.log('Warehouse ID:', initialData.shelf?.rack?.warehouse?.id)
      console.log('Rack from initialData:', initialData.shelf?.rack)
      console.log('Shelf from initialData:', initialData.shelf)
      
      // Set form values from initialData
      setSelectedProduct(String(initialData.productId))
      setSelectedWarehouse(String(initialData.shelf.rack.warehouse.id))
      setSelectedRack(String(initialData.shelf.rack.id))
      setSelectedShelf(String(initialData.shelfId))
      setSelectedUnit(initialData.unit)
      
      if (initialData.expiryDate) {
        setExpiryDate(new Date(initialData.expiryDate))
      }
      // Pre-populate rack and shelf options
      const warehouseId = initialData.shelf.rack.warehouse.id;
      console.log('Looking for warehouse with ID:', warehouseId);
      console.log('Available warehouses:', warehouses.map(w => ({ id: w.id, name: w.name })));
        // Make sure we're comparing numbers to numbers
      const warehouse = warehouses.find(w => w.id === Number(warehouseId));
      console.log('Found warehouse for populating racks:', warehouse);
      
      if (warehouse) {
        console.log('Setting initial rack options:', warehouse.racks);
        setRackOptions(warehouse.racks);
        
        const rack = warehouse.racks.find(r => r.id === Number(initialData.shelf.rack.id));
        console.log('Found rack for populating shelves:', rack);
        
        if (rack) {
          console.log('Setting initial shelf options:', rack.shelves);
          setShelfOptions(rack.shelves);
        }
      }    } else if (initialProductId) {
      const product = currentProducts.find(p => p.id === initialProductId)
      if (product) {
        setSelectedProduct(String(product.id))
        setSelectedUnit(product.primaryUnit)
      }
    }
  }, [initialData, initialProductId, isEditing, currentProducts, warehouses])
  // Filter products when search query changes
  useEffect(() => {
    const filtered = searchQuery
      ? currentProducts.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : currentProducts
    
    setFilteredProducts(filtered)
  }, [searchQuery, currentProducts])// Update rack options when warehouse changes
  useEffect(() => {
    console.log('Selected warehouse changed to:', selectedWarehouse)
    
    if (selectedWarehouse) {
      const warehouse = warehouses.find(w => w.id === Number(selectedWarehouse))
      console.log('Found warehouse:', warehouse)
      
      if (warehouse) {
        console.log('Setting rack options from warehouse:', warehouse.racks)
        setRackOptions(warehouse.racks)
        
        // Only clear selection if not in edit mode or if warehouse changes after initial load
        if (!isEditing || (isEditing && initialData && Number(selectedWarehouse) !== Number(initialData.shelf.rack.warehouse.id))) {
          setShelfOptions([])
          setSelectedRack('')
          setSelectedShelf('')
        }
      }
    } else {
      setRackOptions([])
      setShelfOptions([])
      setSelectedRack('')
      setSelectedShelf('')
    }
  }, [selectedWarehouse, warehouses, isEditing, initialData])
  // Update shelf options when rack changes
  useEffect(() => {
    console.log('Selected rack changed to:', selectedRack)
    
    if (selectedRack) {
      const warehouse = warehouses.find(w => w.id === Number(selectedWarehouse))
      if (warehouse) {
        const rack = warehouse.racks.find(r => r.id === Number(selectedRack))
        if (rack) {
          console.log('Setting shelf options from rack:', rack.shelves)
          setShelfOptions(rack.shelves)
          
          // Only clear shelf selection if not in edit mode or if rack changes after initial load
          if (!isEditing || (isEditing && initialData && Number(selectedRack) !== Number(initialData.shelf.rack.id))) {
            setSelectedShelf('')
          }
        }
      }
    } else {
      setShelfOptions([])
      setSelectedShelf('')
    }
  }, [selectedRack, selectedWarehouse, warehouses, isEditing, initialData])  // Set unit when product changes
  useEffect(() => {
    if (selectedProduct) {
      const product = currentProducts.find(p => p.id === Number(selectedProduct))
      if (product) {
        // In edit mode, preserve the existing unit from initialData unless the product changes
        if (isEditing && initialData && Number(selectedProduct) === initialData.productId && initialData.unit) {
          setSelectedUnit(initialData.unit)
        } else {
          setSelectedUnit(product.primaryUnit)
        }
      }
    } else {
      setSelectedUnit('')
    }
  }, [selectedProduct, currentProducts, isEditing, initialData])
    // Pre-select the product when initialData is loaded
  useEffect(() => {
    if (isEditing && initialData && selectedProduct) {
      const currentProduct = currentProducts.find(p => p.id === Number(selectedProduct))
      if (!currentProduct && initialData.product) {
        console.log('Product in initialData but not in products list:', initialData.product)
      }
    }
  }, [isEditing, initialData, selectedProduct, currentProducts])
  
  // Handle new product creation
  const handleProductCreated = (newProduct: Product) => {
    // Add the new product to the current products list
    setCurrentProducts(prev => [...prev, newProduct])
    
    // Auto-select the newly created product
    setSelectedProduct(String(newProduct.id))
    setSelectedUnit(newProduct.primaryUnit)
    
    // Close the modal
    setIsProductModalOpen(false)
  }
    const handleProductSelection = (value: string) => {
    if (value === 'add-new-product') {
      setIsProductModalOpen(true)
    } else {
      console.log("Product selected:", value);
      setSelectedProduct(value)
    }
  }
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
      // Validate that a product is selected
    if (!selectedProduct || selectedProduct === '') {
      setError('Please select a product before adding inventory.')
      setLoading(false)
      return
    }
    
    // Validate that unit is selected (should be set when product is selected)
    if (!selectedUnit) {
      setError('Product unit not found. Please try selecting the product again.')
      setLoading(false)
      return
    }
      const formData = new FormData(event.currentTarget)
      // Debug logging
    console.log('Form submission debug:', {
      selectedProduct,
      selectedUnit,
      position,
      unitFromForm: formData.get('unit'),
      positionFromForm: formData.get('position')
    })
    
    // Debug logging
    console.log('Form data - selectedUnit:', selectedUnit)
    console.log('Form data - unit field:', formData.get('unit'))
      // Set position value from state
    formData.set('position', position.toString())
    
    if (expiryDate) {
      formData.set('expiryDate', expiryDate.toISOString().split('T')[0])
    }
    
    try {
      let result;
        if (isEditing && initialData) {
        // Update existing inventory
        console.log('Calling updateInventory with ID:', initialData.id)
        result = await updateInventory(initialData.id, formData)
        console.log('UpdateInventory result:', result)
      } else {
        // Create new inventory
        console.log('Calling addInventory')
        result = await addInventory(formData)
        console.log('AddInventory result:', result)
      }
        if (result.success) {
        setSuccess(true)
        
        if (!isEditing) {
          // Reset form only for new inventory - safely check if form is still available
          try {
            if (event.currentTarget && typeof event.currentTarget.reset === 'function') {
              event.currentTarget.reset()
            }            setSelectedProduct('')
            setSelectedWarehouse('')
            setSelectedRack('')
            setSelectedShelf('')
            setPosition(0)
            setExpiryDate(undefined)
          } catch (err) {
            console.error('Form reset error:', err)
          }
        }
        
        // Redirect to inventory page after a delay
        setTimeout(() => {
          router.push('/dashboard/inventory')
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} inventory`)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
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
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Inventory successfully added!</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="productSearch">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="productSearch"
                    placeholder="Search by name or SKU"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
                <div>                <Label htmlFor="productId">Product*</Label>                <div>
                  <input type="hidden" name="productId" value={selectedProduct} />                  <Select
                    value={selectedProduct}
                    onValueChange={handleProductSelection}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Products</SelectLabel>
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                        
                        {/* Add the initial product if it's not in the filtered list */}
                        {isEditing && initialData && initialData.product && 
                         !filteredProducts.some(p => p.id === initialData.product.id) && (
                          <SelectItem key={initialData.product.id} value={String(initialData.product.id)}>
                            {initialData.product.name} ({initialData.product.sku}) - Current
                          </SelectItem>
                        )}
                      </SelectGroup>
                      
                      <SelectGroup>
                        <SelectLabel>Actions</SelectLabel>
                        <SelectItem value="add-new-product" className="text-primary font-medium">
                          <div className="flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Product
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>                <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity*</Label>                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter quantity (0 for out of stock)"
                    defaultValue={isEditing && initialData ? initialData.quantity : ''}
                    required
                  />
                </div>
                
                <div>                  <Label htmlFor="unit">Unit*</Label>
                  <div>
                    <input type="hidden" name="unit" value={selectedUnit} />
                    <Select
                      value={selectedUnit}
                      onValueChange={(value) => {
                        console.log("Unit selected:", value);
                        setSelectedUnit(value);
                      }}
                    >                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Units</SelectLabel>
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
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                  <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter position number"                    value={position}
                    onChange={(e) => {
                      const newPosition = Number(e.target.value) || 0;
                      console.log('Position input changed:', e.target.value, '-> parsed:', newPosition);
                      setPosition(newPosition);
                    }}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>                <Input
                  id="batchNumber"
                  name="batchNumber"
                  placeholder="Enter batch number"
                  defaultValue={isEditing && initialData ? initialData.batchNumber || '' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <DatePicker
                  id="expiryDate"
                  date={expiryDate}
                  setDate={setExpiryDate}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">              <div>
                <Label htmlFor="warehouseId">Warehouse*</Label>
                <div>
                  <input type="hidden" name="warehouseId" value={selectedWarehouse} />
                  <Select
                    value={selectedWarehouse}
                    onValueChange={(value) => {
                      console.log("Warehouse selected:", value);
                      setSelectedWarehouse(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Warehouses</SelectLabel>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>                <div>
                <Label htmlFor="rackId">Rack*</Label>
                <div>
                  <input type="hidden" name="rackId" value={selectedRack} />
                  <Select
                    value={selectedRack || undefined}
                    onValueChange={(value) => {
                      console.log("Rack selected:", value, "Type:", typeof value);
                      console.log("Available rack options:", rackOptions);
                      setSelectedRack(value);
                    }}
                    disabled={!selectedWarehouse}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {selectedRack && rackOptions.find(r => String(r.id) === selectedRack)
                          ? rackOptions.find(r => String(r.id) === selectedRack)?.rackCode
                          : (selectedWarehouse ? "Select rack" : "Select warehouse first")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Racks</SelectLabel>
                        {
                        rackOptions.map((rack) => (
                          <SelectItem key={rack.id} value={String(rack.id)}>
                            {rack.rackCode}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                <div>
                <Label htmlFor="shelfId">Shelf*</Label>
                <div>
                  <input type="hidden" name="shelfId" value={selectedShelf} />                  <Select
                    value={selectedShelf}
                    onValueChange={(value) => {
                      console.log("Shelf selected:", value, "Type:", typeof value);
                      console.log("Available shelf options:", shelfOptions);
                      setSelectedShelf(value);
                    }}
                    disabled={!selectedRack}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={selectedRack ? "Select shelf" : "Select rack first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Shelves</SelectLabel>
                        {shelfOptions.map((shelf) => (
                          <SelectItem key={shelf.id} value={String(shelf.id)}>
                            {shelf.shelfCode}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="documentReference">Document Reference</Label>                <Input
                  id="documentReference"
                  name="documentReference"
                  placeholder="Enter reference document"
                  defaultValue={isEditing && initialData?.transactions && initialData.transactions.length > 0 ? initialData.transactions[0].documentReference || '' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>                <Textarea
                  id="reason"
                  name="reason"
                  placeholder={isEditing ? "Enter reason for updating inventory" : "Enter reason for adding inventory"}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard/inventory')}
          className="mr-2"
        >
          Cancel
        </Button>        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update' : 'Add'} Inventory        </Button>
      </div>
    </form>
      
    {/* Product Creation Modal */}
    <ProductModal
      isOpen={isProductModalOpen}
      onClose={() => setIsProductModalOpen(false)}
      categories={categories}
      statusTypes={statusTypes}
      onProductCreated={handleProductCreated}
    />
    </>
  )
}
