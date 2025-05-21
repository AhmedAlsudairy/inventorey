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

interface Inventory {  id: number;
  quantity: number;
  unit: string;
  batchNumber: string | null;
  expiryDate: Date | null;product: {
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
    rack: {
      id: number
      rackCode: string
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
  
  const filteredInventory = searchQuery
    ? inventory.filter(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.product.documentNo && item.product.documentNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.shelf.rack.warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.rack.rackCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.shelfCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : inventory

  const openDeleteDialog = (id: number, productName: string) => {
    setInventoryToDelete({ id, productName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteInventory = async (id: number) => {
    const result = await deleteInventory(id)
    if (result.success) {
      router.refresh()
    } else {
      console.error("Failed to delete inventory:", result.error)
      // You could add toast notifications here
    }
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
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return { label: 'Expired', variant: 'destructive' as const }
    }
    if (item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      return { label: 'Expiring Soon', variant: 'warning' as const }
    }
    return { label: 'Available', variant: 'default' as const }
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => {
                const status = getInventoryStatus(item)
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product.name}</div>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{item.shelf.rack.warehouse.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.shelf.rack.rackCode} &gt; {item.shelf.shelfCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.batchNumber || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(item.expiryDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/inventory/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(item.id, item.product.name)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More actions</span>
                            </Button>
                          </DropdownMenuTrigger><DropdownMenuContent align="end">
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
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery
                    ? 'No inventory records match your search.'
                    : 'No inventory records have been added yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>      {inventoryToDelete && (
        <DeleteInventoryModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (inventoryToDelete) {
              handleDeleteInventory(inventoryToDelete.id)
            }
          }}
          inventoryItem={inventoryToDelete}
        />
      )}
    </>
  )
}
