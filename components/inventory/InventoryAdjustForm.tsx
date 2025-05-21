'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { adjustInventory } from '@/app/actions/inventory'
import { AlertCircle, ArrowLeft, Check, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface InventoryAdjustFormProps {
  inventory: {
    id: number
    quantity: number
    unit: string
    product: {
      name: string
      sku: string
    }
    shelf: {
      shelfCode: string
      rack: {
        rackCode: string
        warehouse: {
          name: string
        }
      }
    }
  }
}

export default function InventoryAdjustForm({ 
  inventory 
}: InventoryAdjustFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [transactionType, setTransactionType] = useState<'add' | 'remove' | 'adjust'>('add')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(event.currentTarget)
    formData.append('inventoryId', String(inventory.id))
    formData.append('transactionType', transactionType)
      try {
      const result = await adjustInventory(formData)
        if (result.success) {
        setSuccess(true)
        // Reset form - safely check if form is still available
        try {
          if (event.currentTarget && typeof event.currentTarget.reset === 'function') {
            event.currentTarget.reset()
          }
        } catch (err) {
          console.error('Form reset error:', err)
        }
        
        // Redirect to inventory detail page after a delay
        setTimeout(() => {
          router.push(`/dashboard/inventory/${inventory.id}`)
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory')
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
        
        <h1 className="text-2xl font-bold tracking-tight">Adjust Inventory</h1>
        <p className="text-muted-foreground mb-2">
          {inventory.product.name} ({inventory.product.sku})
        </p>
        <p className="text-sm text-muted-foreground">
          Location: {inventory.shelf.rack.warehouse.name} &gt; {inventory.shelf.rack.rackCode} &gt; {inventory.shelf.shelfCode}
        </p>
        <p className="text-sm font-medium">
          Current quantity: {inventory.quantity} {inventory.unit}
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
            <AlertDescription>Inventory successfully adjusted!</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label>Adjustment Type</Label>              <RadioGroup 
                  value={transactionType}
                  onValueChange={(value: string) => setTransactionType(value as 'add' | 'remove' | 'adjust')}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add" className="cursor-pointer">Add to existing quantity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remove" id="remove" />
                    <Label htmlFor="remove" className="cursor-pointer">Remove from existing quantity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adjust" id="adjust" />
                    <Label htmlFor="adjust" className="cursor-pointer">Set to specific quantity</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="quantityChange">
                  {transactionType === 'add' 
                    ? 'Quantity to Add' 
                    : transactionType === 'remove'
                      ? 'Quantity to Remove'
                      : 'New Quantity'
                  }*
                </Label>
                <Input
                  id="quantityChange"
                  name="quantityChange"
                  type="number"
                  min={transactionType === 'adjust' ? '0' : '0.01'} 
                  step="0.01"
                  placeholder={`Enter ${transactionType === 'adjust' ? 'new' : ''} quantity`}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Unit: {inventory.unit}
                </p>
              </div>
              
              <div>
                <Label htmlFor="documentReference">Document Reference</Label>
                <Input
                  id="documentReference"
                  name="documentReference"
                  placeholder="Enter reference document"
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason*</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Enter reason for adjustment"
                  rows={3}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
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
            Save Changes
          </Button>
        </div>
      </form>
    </>
  )
}
