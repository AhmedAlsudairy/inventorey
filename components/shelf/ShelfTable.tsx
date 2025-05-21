// components/shelf/ShelfTable.tsx
"use client";

import { deleteShelf } from "@/app/actions/shelf";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shelf } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ShelfWithRelations extends Shelf {
  rack: {
    rackCode: string;
    warehouseId: number;
    warehouse: {
      name: string;
    };
  };
  _count: {
    inventory: number;
  };
}

interface ShelfTableProps {
  shelves: ShelfWithRelations[];
  showRack?: boolean;
  showWarehouse?: boolean;
}

export function ShelfTable({ 
  shelves, 
  showRack = false,
  showWarehouse = false 
}: ShelfTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<ShelfWithRelations | null>(null);
  const router = useRouter();

  const handleDeleteClick = (shelf: ShelfWithRelations) => {
    setSelectedShelf(shelf);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedShelf) return;
    setIsDeleting(true);

    const formData = new FormData();
    formData.append("id", selectedShelf.id.toString());
    formData.append("rackId", selectedShelf.rackId.toString());

    const result = await deleteShelf(formData);

    if (result.success) {
      toast.success("Shelf deleted successfully");
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete shelf");
    }

    setIsDeleting(false);
  };

  const getStatusBadgeClass = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Active";
      case 2:
        return "Maintenance";
      default:
        return "Inactive";
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shelf Code</TableHead>
              <TableHead>Position</TableHead>
              {showRack && <TableHead>Rack</TableHead>}
              {showWarehouse && <TableHead>Warehouse</TableHead>}
              <TableHead>Capacity (kg)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shelves.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showWarehouse ? (showRack ? 7 : 6) : (showRack ? 6 : 5)}
                  className="text-center h-24 text-muted-foreground"
                >
                  No shelves found
                </TableCell>
              </TableRow>
            ) : (
              shelves.map((shelf) => (
                <TableRow key={shelf.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/shelves/${shelf.id}`} className="hover:underline">
                      {shelf.shelfCode}
                    </Link>
                  </TableCell>
                  <TableCell>{shelf.position}</TableCell>
                  {showRack && (
                    <TableCell>
                      <Link
                        href={`/dashboard/racks/${shelf.rackId}`}
                        className="hover:underline"
                      >
                        {shelf.rack.rackCode}
                      </Link>
                    </TableCell>
                  )}
                  {showWarehouse && (
                    <TableCell>
                      <Link
                        href={`/dashboard/warehouses/${shelf.rack.warehouseId}`}
                        className="hover:underline"
                      >
                        {shelf.rack.warehouse.name}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell>{shelf.capacityKg}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                        shelf.status
                      )}`}
                    >
                      {getStatusText(shelf.status)}
                    </span>
                  </TableCell>                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/shelves/${shelf.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(shelf)}
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete shelf{" "}
              <span className="font-bold">{selectedShelf?.shelfCode}</span>?
              {selectedShelf && selectedShelf._count.inventory > 0 && (
                <p className="text-red-500 mt-2">
                  This shelf has {selectedShelf._count.inventory} inventory items. You must remove
                  all inventory items before deleting the shelf.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}              disabled={
                isDeleting ||
                !!(selectedShelf && selectedShelf._count.inventory > 0)
              }
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
