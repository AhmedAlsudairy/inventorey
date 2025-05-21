'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  PackageOpen,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft
} from 'lucide-react'

interface InventoryTransaction {
  id: number
  transactionType: string
  quantityBefore: number
  quantityChange: number
  quantityAfter: number
  unit: string
  reason: string | null
  documentReference: string | null
  timestamp: Date
  userId: string
}

interface InventoryDetailProps {
  inventory: {
    id: number
    productId: number
    shelfId: number
    quantity: number
    unit: string
    batchNumber: string | null
    expiryDate: Date | null
    product: {
      id: number
      name: string
      sku: string
      category: {
        name: string
      }
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
    transactions: InventoryTransaction[]
  }
}

export default function InventoryDetail({ inventory }: InventoryDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('details')

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInventoryStatus = () => {
    if (inventory.expiryDate && new Date(inventory.expiryDate) < new Date()) {
      return { label: 'Expired', variant: 'destructive' as const }
    }
    if (inventory.expiryDate && new Date(inventory.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      return { label: 'Expiring Soon', variant: 'warning' as const }
    }
    return { label: 'Available', variant: 'default' as const }
  }

  const getTransactionTypeDetails = (type: string) => {
    switch(type) {
      case 'initial':
        return { 
          icon: <ArrowDown className="h-4 w-4" />, 
          label: 'Initial', 
          variant: 'default' as const
        }
      case 'add':
        return { 
          icon: <ArrowDown className="h-4 w-4" />, 
          label: 'Addition', 
          variant: 'default' as const
        }
      case 'remove':
        return { 
          icon: <ArrowUp className="h-4 w-4" />, 
          label: 'Removal', 
          variant: 'destructive' as const
        }
      case 'adjust':
        return { 
          icon: <Edit className="h-4 w-4" />, 
          label: 'Adjustment', 
          variant: 'secondary' as const
        }
      case 'transfer_in':
        return { 
          icon: <ArrowDown className="h-4 w-4" />, 
          label: 'Transfer In', 
          variant: 'default' as const
        }
      case 'transfer_out':
        return { 
          icon: <ArrowUp className="h-4 w-4" />, 
          label: 'Transfer Out', 
          variant: 'destructive' as const
        }
      default:
        return { 
          icon: <ArrowRightLeft className="h-4 w-4" />, 
          label: type, 
          variant: 'outline' as const
        }
    }
  }

  const status = getInventoryStatus()

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="mb-1"
            >
              <Link href="/dashboard/inventory">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Inventory
              </Link>
            </Button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{inventory.product.name}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{inventory.product.sku}</Badge>
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/dashboard/inventory/${inventory.id}/adjust`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Adjust
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => router.push(`/dashboard/inventory/${inventory.id}/transfer`)}
          >
            <PackageOpen className="h-4 w-4 mr-2" />
            Transfer
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Inventory Details</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History ({inventory.transactions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                    <p className="font-medium">{inventory.product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SKU</p>
                    <p>{inventory.product.sku}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p>{inventory.product.category.name}</p>
                </div>
                
                <div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/products/${inventory.product.id}`}>
                      View Product Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                  <p className="font-medium">{inventory.shelf.rack.warehouse.name}</p>
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
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Inventory Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                    <p className="text-xl font-bold">{inventory.quantity} {inventory.unit}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batch Number</p>
                    <p>{inventory.batchNumber || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                    <p>{formatDate(inventory.expiryDate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.transactions.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No transaction history available</p>              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-medium">Date/Time</th>
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-left p-2 font-medium">Before</th>
                        <th className="text-left p-2 font-medium">Change</th>
                        <th className="text-left p-2 font-medium">After</th>
                        <th className="text-left p-2 font-medium">Document No</th>
                        <th className="text-left p-2 font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.transactions.map(transaction => {
                        const typeDetails = getTransactionTypeDetails(transaction.transactionType)
                        return (
                          <tr key={transaction.id} className="border-b">
                            <td className="p-2">
                              {formatDateTime(transaction.timestamp)}
                            </td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <Badge variant={typeDetails.variant} className="flex items-center gap-1">
                                  {typeDetails.icon}
                                  {typeDetails.label}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-2">
                              {transaction.quantityBefore} {transaction.unit}
                            </td>
                            <td className="p-2">
                              {transaction.quantityChange > 0 && '+'}
                              {transaction.quantityChange} {transaction.unit}
                            </td>
                            <td className="p-2">
                              {transaction.quantityAfter} {transaction.unit}
                            </td>
                            <td className="p-2">
                              {transaction.documentReference || '-'}
                            </td>
                            <td className="p-2">
                              {transaction.reason || '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
