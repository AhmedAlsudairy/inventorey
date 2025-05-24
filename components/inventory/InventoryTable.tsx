'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Edit, Eye, MoreHorizontal, PackageOpen, Search, Trash2 } from 'lucide-react'
import { deleteInventory } from '@/app/actions/inventory/deleteInventory'
import { DeleteInventoryModal } from './DeleteInventoryModal'
import { toast } from 'sonner'

interface Inventory {
  id: number;
  quantity: number;
  unit: string;
  position: number;
  batchNumber: string | null;
  expiryDate: Date | null;
  product: {
    id: number
    name: string
    sku: string
    documentNo: string | null
    productType: string
    category: {
      name: string
    }
  }
  shelf: {
    id: number
    shelfCode: string
    position: string
    rack: {
      id: number
      rackCode: string
      location: string
      warehouse: {
        id: number
        name: string
      }
    }
  }
  _count: {
    transactions: number
  }
}

interface InventoryTableProps {
  inventory: Inventory[]
}

export default function InventoryTable({ inventory }: InventoryTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  // Add state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inventoryToDelete, setInventoryToDelete] = useState<{ id: number, productName: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const filteredInventory = searchQuery
    ? inventory.filter(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.product.documentNo && item.product.documentNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.shelf.rack.warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.rack.rackCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.shelfCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.rack.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.position.toString().includes(searchQuery)
      )
    : inventory

  const openDeleteDialog = (id: number, productName: string) => {
    setInventoryToDelete({ id, productName })
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteInventory = async (id: number) => {
    try {
      setIsDeleting(true)
      const result = await deleteInventory(id)
      if (result.success) {
        // Close the dialog first
        setDeleteDialogOpen(false)
        // Reset the inventory to delete
        setInventoryToDelete(null)
        // Show success toast
        toast.success("Inventory deleted successfully")
        // Force a complete refresh of the inventory data
        refreshData()
      } else {
        const errorMessage = 'error' in result ? result.error : 'Unknown error'
        console.error("Failed to delete inventory:", errorMessage)
        toast.error(`Failed to delete inventory: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Error deleting inventory:", error)
      toast.error("An unexpected error occurred while deleting inventory")
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

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
  }
  const getInventoryStatus = (item: Inventory) => {
    // Check if quantity is zero first
    if (item.quantity === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const }
    }
    
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return { label: 'Expired', variant: 'destructive' as const }
    }
    if (item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      return { label: 'Expiring Soon', variant: 'warning' as const }
    }
    return { label: 'Available', variant: 'default' as const }
  }

  return (
    <>      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 gap-2 sm:gap-0">
        <div className="flex items-center relative w-full sm:w-auto">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />          <Input
            placeholder="Search inventory (product, location, position)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:max-w-sm"
          />
        </div>
      </div>      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>            <TableRow>
              <TableHead className="whitespace-nowrap">Product Info</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Location (Warehouse → Rack → Shelf)</TableHead>
              <TableHead className="whitespace-nowrap">Quantity</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Batch</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Expiry</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-[60px] sm:w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => {
                const status = getInventoryStatus(item)
                
                return (                  <TableRow key={item.id}>
                    <TableCell className="p-2 sm:p-4">
                      <div>
                        <div className="font-medium line-clamp-1">{item.product.name}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground">{item.product.sku}</span>
                          <Badge variant="outline" className={item.product.productType === 'permanent' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}>
                            {item.product.productType === 'permanent' ? 'Permanent' : 'Consumable'}
                          </Badge>
                          {item.product.documentNo && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                              Doc: {item.product.documentNo}
                            </span>
                          )}
                        </div>                        <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                          <div className="flex flex-wrap gap-1 items-center">
                            <Link 
                              href={`/dashboard/warehouses/${item.shelf.rack.warehouse.id}`}
                              className="hover:underline text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded font-medium"
                            >
                              🏢 {item.shelf.rack.warehouse.name}
                            </Link>
                            <span>→</span>
                            <Link 
                              href={`/dashboard/racks/${item.shelf.rack.id}`}
                              className="hover:underline hover:text-gray-700 bg-gray-50 px-2 py-1 rounded"
                            >
                              🗂️ {item.shelf.rack.rackCode}
                            </Link>
                            <span>→</span>
                            <Link 
                              href={`/dashboard/shelves/${item.shelf.id}`}
                              className="hover:underline hover:text-gray-700 bg-gray-50 px-2 py-1 rounded"
                            >
                              📚 {item.shelf.shelfCode}
                            </Link>
                          </div>                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                              📍 {item.shelf.rack.location}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                              📋 Shelf: {item.shelf.position}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                              🔢 Item: {item.position}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>                    <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                      <div>
                        <div className="flex flex-wrap gap-1 items-center mb-2">
                          <Link 
                            href={`/dashboard/warehouses/${item.shelf.rack.warehouse.id}`}
                            className="hover:underline font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-sm"
                          >
                            🏢 {item.shelf.rack.warehouse.name}
                          </Link>
                          <span className="text-gray-400">→</span>
                          <Link 
                            href={`/dashboard/racks/${item.shelf.rack.id}`}
                            className="hover:underline hover:text-gray-700 bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            🗂️ {item.shelf.rack.rackCode}
                          </Link>
                          <span className="text-gray-400">→</span>
                          <Link 
                            href={`/dashboard/shelves/${item.shelf.id}`}
                            className="hover:underline hover:text-gray-700 bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            📚 {item.shelf.shelfCode}
                          </Link>
                        </div>                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            📍 Location: {item.shelf.rack.location}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            📋 Shelf Position: {item.shelf.position}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                            🔢 Item Position: {item.position}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <span className="whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell p-2 sm:p-4">
                      {item.batchNumber || '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell p-2 sm:p-4">
                      {formatDate(item.expiryDate)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">                      <div className="flex gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/dashboard/inventory/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteDialog(item.id, item.product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More actions</span>
                            </Button>
                          </DropdownMenuTrigger><DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${item.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${item.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${item.id}/adjust`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Adjust
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${item.id}/transfer`)}>
                            <PackageOpen className="h-4 w-4 mr-2" />
                            Transfer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600" 
                            onClick={() => openDeleteDialog(item.id, item.product.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (              <TableRow>
                <TableCell colSpan={7} className="h-16 sm:h-24 text-center p-2 sm:p-4">
                  {searchQuery
                    ? 'No inventory records match your search.'
                    : 'No inventory records have been added yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>      </div>      {inventoryToDelete && (
        <DeleteInventoryModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (inventoryToDelete) {
              handleDeleteInventory(inventoryToDelete.id)
            }
          }}
          inventoryItem={inventoryToDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
