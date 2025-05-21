'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { transferInventory } from '@/app/actions/inventory'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

interface InventoryTransferFormProps {
  inventory: {
    id: number
    quantity: number
    unit: string
    product: {
      name: string
      sku: string
    }
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
  }
  warehouses: Warehouse[]
}

export default function InventoryTransferForm({ 
  inventory,
  warehouses
}: InventoryTransferFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [selectedRack, setSelectedRack] = useState<string>('')
  const [selectedShelf, setSelectedShelf] = useState<string>('')
  
  const [rackOptions, setRackOptions] = useState<Array<{ id: number; rackCode: string }>>([])
  const [shelfOptions, setShelfOptions] = useState<Array<{ id: number; shelfCode: string }>>([])
  
  // Update rack options when warehouse changes
  useEffect(() => {
    if (selectedWarehouse) {
      const warehouse = warehouses.find(w => w.id === Number(selectedWarehouse))
      if (warehouse) {
        setRackOptions(warehouse.racks)
        setShelfOptions([])
        setSelectedRack('')
        setSelectedShelf('')
      }
    } else {
      setRackOptions([])
      setShelfOptions([])
      setSelectedRack('')
      setSelectedShelf('')
    }
  }, [selectedWarehouse, warehouses])

  // Update shelf options when rack changes
  useEffect(() => {
    if (selectedRack) {
      const warehouse = warehouses.find(w => w.id === Number(selectedWarehouse))
      if (warehouse) {
        const rack = warehouse.racks.find(r => r.id === Number(selectedRack))
        if (rack) {
          setShelfOptions(rack.shelves)
          setSelectedShelf('')
        }
      }
    } else {
      setShelfOptions([])
      setSelectedShelf('')
    }
  }, [selectedRack, selectedWarehouse, warehouses])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(event.currentTarget)
    formData.append('sourceInventoryId', String(inventory.id))
      try {
      const result = await transferInventory(formData)
        if (result.success) {
        setSuccess(true)
        // Reset form - safely check if form is still available
        try {
          if (event.currentTarget && typeof event.currentTarget.reset === 'function') {
            event.currentTarget.reset()
          }
          // Reset form state
          setSelectedWarehouse('')
          setSelectedRack('')
          setSelectedShelf('')
        } catch (err) {
          console.error('Form reset error:', err)
        }
        
        // Redirect to inventory detail page after a delay
        setTimeout(() => {
          router.push(`/dashboard/inventory/${inventory.id}`)
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || 'An error occurred during transfer')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to transfer inventory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="mb-2"
        >
          <Link href={`/dashboard/inventory/${inventory.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Inventory Details
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold tracking-tight">Transfer Inventory</h1>
        <p className="text-muted-foreground mb-2">
          {inventory.product.name} ({inventory.product.sku})
        </p>
        <p className="text-sm text-muted-foreground">
          Current location: {inventory.shelf.rack.warehouse.name} &gt; {inventory.shelf.rack.rackCode} &gt; {inventory.shelf.shelfCode}
        </p>
        <p className="text-sm font-medium">
          Available quantity: {inventory.quantity} {inventory.unit}
        </p>
      </div>
      
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
            <AlertDescription>Inventory successfully transferred!</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Source Location</h3>
                
                <div className="rounded-md border p-4 bg-muted/50">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                      <p>{inventory.shelf.rack.warehouse.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rack</p>
                        <p>{inventory.shelf.rack.rackCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Shelf</p>
                        <p>{inventory.shelf.shelfCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity to Transfer*</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0.01"
                    max={inventory.quantity}
                    step="0.01"
                    placeholder="Enter quantity to transfer"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Unit: {inventory.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Destination Location</h3>
                
                <div>
                  <Label htmlFor="warehouseId">Target Warehouse*</Label>
                  <Select 
                    name="warehouseId" 
                    value={selectedWarehouse} 
                    onValueChange={setSelectedWarehouse}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="rackId">Target Rack*</Label>
                  <Select 
                    name="rackId" 
                    value={selectedRack} 
                    onValueChange={setSelectedRack}
                    disabled={!selectedWarehouse}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedWarehouse ? "Select rack" : "Select warehouse first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {rackOptions.length === 0 ? (
                        <div className="text-center py-2 text-muted-foreground">
                          No racks available
                        </div>
                      ) : (
                        rackOptions.map((rack) => (
                          <SelectItem key={rack.id} value={String(rack.id)}>
                            {rack.rackCode}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetShelfId">Target Shelf*</Label>
                  <Select 
                    name="targetShelfId" 
                    value={selectedShelf} 
                    onValueChange={setSelectedShelf}
                    disabled={!selectedRack}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedRack ? "Select shelf" : "Select rack first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {shelfOptions.length === 0 ? (
                        <div className="text-center py-2 text-muted-foreground">
                          No shelves available
                        </div>
                      ) : (
                        shelfOptions.map((shelf) => (
                          <SelectItem key={shelf.id} value={String(shelf.id)}>
                            {shelf.shelfCode}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="reason">Reason for Transfer*</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Enter reason for inventory transfer"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="documentReference">Document Reference</Label>
                  <Input
                    id="documentReference"
                    name="documentReference"
                    placeholder="Enter reference document"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <div className="rounded-full border p-2 bg-muted/50">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/dashboard/inventory/${inventory.id}`)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Transfer Inventory
          </Button>
        </div>
      </form>
    </>
  )
}
