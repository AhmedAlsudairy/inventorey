'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { deleteProduct } from '@/app/actions/product'
import { Edit, Eye, MoreHorizontal, Search, Trash2, Loader2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  sku: string
  documentNo: string | null
  productType: string
  category: {
    name: string
  }
  status: {
    name: string
  }
  inventory: Array<{
    quantity: number
    unit: string
  }>
}

interface ProductTableProps {
  products: Product[]
}

export default function ProductTable({ products }: ProductTableProps) {  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredProducts = searchQuery
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  const getTotalStock = (product: Product) => {
    return product.inventory.reduce((total, inv) => total + inv.quantity, 0)
  }

  const getUnitLabel = (product: Product) => {
    if (product.inventory.length === 0) return '';
    return product.inventory[0].unit;
  }
  const handleDelete = async (id: number) => {
    try {
      setDeleteError(null)
      setIsDeleting(true)
      
      const formData = new FormData()
      formData.append('id', String(id))
      
      const result = await deleteProduct(formData)
      
      if (result.success) {
        setIsDeleteDialogOpen(false)
        toast.success("Product deleted successfully")
        refreshData()
      } else {
        setDeleteError(result.error || 'Failed to delete product')
        toast.error(result.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setDeleteError('An unexpected error occurred')
      toast.error("An unexpected error occurred while deleting product")
    } finally {
      setIsDeleting(false)
    }
  }
  
  // This helps ensure the page is properly revalidated after deletion
  const refreshData = () => {
    // Use router.refresh() to update server components
    router.refresh()
    
    // Optional: Add a slight delay to ensure revalidation is complete
    setTimeout(() => {
      // This is a fallback to ensure the UI is updated if router.refresh() isn't enough
      window.location.href = window.location.href
    }, 100)
  }

  const openDeleteDialog = (id: number) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  return (
    <>      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 gap-2 sm:gap-0">
        <div className="flex items-center relative w-full sm:w-auto">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:max-w-sm"
          />
        </div>
      </div>      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Product Info</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Category</TableHead>
              <TableHead className="whitespace-nowrap">Stock</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-[60px] sm:w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (                <TableRow key={product.id}>
                  <TableCell className="font-medium p-2 sm:p-4">
                    <div className="flex flex-col gap-1">
                      <span className="line-clamp-1">{product.name}</span>
                      <span className="text-xs text-muted-foreground md:hidden">{product.category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm">{product.sku}</div>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className={product.productType === 'permanent' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}>
                          {product.productType === 'permanent' ? 'Permanent' : 'Consumable'}
                        </Badge>
                        {product.documentNo && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            Doc: {product.documentNo}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-2 sm:p-4">{product.category.name}</TableCell>
                  <TableCell className="p-2 sm:p-4">
                    <span className="whitespace-nowrap">
                      {getTotalStock(product) > 0 
                        ? `${getTotalStock(product)} ${getUnitLabel(product)}` 
                        : 'Out of stock'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                    <Badge variant={product.status.name === 'Active' ? 'default' : 'secondary'}>
                      {product.status.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 sm:p-4">                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (              <TableRow>
                <TableCell colSpan={6} className="h-16 sm:h-24 text-center p-2 sm:p-4">
                  {searchQuery
                    ? 'No products match your search.'
                    : 'No products have been added yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
              {deleteError && (
                <p className="text-destructive mt-2">{deleteError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
