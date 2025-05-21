// components/warehouse/WarehouseTable.tsx
"use client";

import { Warehouse } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface WarehouseWithCount extends Warehouse {
  _count: {
    racks: number;
  };
}

interface WarehouseTableProps {
  warehouses: WarehouseWithCount[];
  deleteWarehouse: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function WarehouseTable({ warehouses, deleteWarehouse }: WarehouseTableProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    
    const formData = new FormData();
    formData.append('id', id.toString());
    
    const result = await deleteWarehouse(formData);
    
    if (result.success) {
      toast.success('Warehouse deleted successfully');
      setDialogOpen(false);
    } else {
      toast.error(result.error || 'Failed to delete warehouse');
    }
    
    setIsDeleting(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Racks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No warehouses found. Create your first warehouse.
              </TableCell>
            </TableRow>
          )}
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="font-medium">
                <Link href={`/dashboard/warehouses/${warehouse.id}`} className="hover:underline">
                  {warehouse.name}
                </Link>
              </TableCell>
              <TableCell>{warehouse.location}</TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  warehouse.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : warehouse.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {warehouse.status}
                </span>
              </TableCell>
              <TableCell>{warehouse._count.racks}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/warehouses/${warehouse.id}/edit`}>Edit</Link>
                  </Button>
                  
                  <Dialog open={dialogOpen && isDeleting === warehouse.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setIsDeleting(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setIsDeleting(warehouse.id)}
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Warehouse</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete {warehouse.name}? This action cannot be undone.
                          {warehouse._count.racks > 0 && (
                            <p className="text-red-500 mt-2">
                              Warning: This warehouse has {warehouse._count.racks} rack{warehouse._count.racks > 1 ? 's' : ''}. 
                              You need to delete all racks first.
                            </p>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDelete(warehouse.id)}
                          disabled={isDeleting !== null || warehouse._count.racks > 0}
                        >
                          {isDeleting === warehouse.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
