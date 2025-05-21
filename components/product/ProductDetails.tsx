'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { deleteProduct } from '@/app/actions/product'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, Edit, Package, Trash2, Truck, Warehouse 
} from 'lucide-react'
import { Prisma } from '@prisma/client'

interface ProductDetailsProps {
  product: {
    id: number
    name: string
  description: string | null
  documentNo: string | null
  sku: string;
  categoryId: number
    productType: string
    primaryUnit: string
    dimensions: Prisma.JsonValue
    specifications: Prisma.JsonValue
    statusId: number
    createdAt: Date
    category: {
      id: number
      name: string
    }
    status: {
      id: number
      name: string
    }
    inventory: Array<{
      id: number
      quantity: number
      unit: string
      batchNumber: string | null
      expiryDate: Date | null
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
    }>
  }
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const getTotalStock = () => {
    return product.inventory.reduce((total, inv) => total + inv.quantity, 0)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = async () => {
    setDeleteError(null)
    
    const formData = new FormData()
    formData.append('id', String(product.id))
    
    const result = await deleteProduct(formData)
    
    if (result.success) {
      router.push('/dashboard/products')
    } else {
      setDeleteError(result.error || 'Failed to delete product')
    }
  }

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
              <Link href="/dashboard/products">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Products
              </Link>
            </Button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{product.sku}</Badge>
            <Badge variant={product.status.name === 'Active' ? 'default' : 'secondary'}>
              {product.status.name}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory ({product.inventory.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p>{product.category.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Product Type</p>
                    <p className="capitalize">{product.productType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Unit</p>
                    <p>{product.primaryUnit}</p>
                  </div>
                </div>
                
                <Separator />
                
                {product.documentNo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Document No.</p>
                    <p>{product.documentNo}</p>
                  </div>
                )}
                
                {product.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{formatDate(product.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Dimensions</CardTitle>
              </CardHeader>
              <CardContent>                {product.dimensions ? (
                  <div className="space-y-2">
                    {typeof product.dimensions === 'object' && product.dimensions !== null && 'length' in product.dimensions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Length</p>
                        <p>{String(product.dimensions.length)}</p>
                      </div>
                    )}
                    
                    {typeof product.dimensions === 'object' && product.dimensions !== null && 'width' in product.dimensions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Width</p>
                        <p>{String(product.dimensions.width)}</p>
                      </div>
                    )}
                    
                    {typeof product.dimensions === 'object' && product.dimensions !== null && 'height' in product.dimensions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Height</p>
                        <p>{String(product.dimensions.height)}</p>
                      </div>
                    )}
                    
                    {typeof product.dimensions === 'object' && product.dimensions !== null && 'weight' in product.dimensions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Weight</p>
                        <p>{String(product.dimensions.weight)}</p>
                      </div>
                    )}
                    
                    {typeof product.dimensions === 'object' && product.dimensions !== null && 'volume' in product.dimensions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Volume</p>
                        <p>{String(product.dimensions.volume)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No dimension information available</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>                {product.specifications && typeof product.specifications === 'object' && product.specifications !== null && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(product.specifications as Record<string, unknown>).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-muted-foreground">{key}</p>
                        <p>{String(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specifications available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inventory Status</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Stock: {getTotalStock()} {product.primaryUnit}
                </p>
              </div>
              <Button size="sm" onClick={() => router.push('/dashboard/inventory/new')}>
                <Package className="h-4 w-4 mr-2" />
                Add Inventory
              </Button>
            </CardHeader>
            <CardContent>
              {product.inventory.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-medium">Location</th>
                        <th className="text-left p-2 font-medium">Quantity</th>
                        <th className="text-left p-2 font-medium">Batch</th>
                        <th className="text-left p-2 font-medium">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.inventory.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">
                            <div className="flex items-center">
                              <div className="flex items-center gap-1 text-sm">
                                <Warehouse className="h-4 w-4 text-muted-foreground" />
                                <span>{item.shelf.rack.warehouse.name}</span>
                              </div>
                              <span className="mx-1 text-muted-foreground">›</span>
                              <div className="flex items-center gap-1 text-sm">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span>{item.shelf.rack.rackCode}</span>
                              </div>
                              <span className="mx-1 text-muted-foreground">›</span>
                              <div className="flex items-center gap-1 text-sm">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span>{item.shelf.shelfCode}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-2">
                            {item.batchNumber || '-'}
                          </td>
                          <td className="p-2">
                            {item.expiryDate ? formatDate(item.expiryDate) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No inventory records found for this product</p>
                  <Button className="mt-4" size="sm" onClick={() => router.push('/dashboard/inventory/new')}>
                    Add Inventory
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{product.name}&quot;. This action cannot be undone.
              {deleteError && (
                <p className="text-destructive mt-2">{deleteError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
