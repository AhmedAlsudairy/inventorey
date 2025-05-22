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
    <>      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Shelf Code</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Position</TableHead>
              {showRack && <TableHead className="whitespace-nowrap hidden md:table-cell">Rack</TableHead>}
              {showWarehouse && <TableHead className="whitespace-nowrap hidden md:table-cell">Warehouse</TableHead>}
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Capacity</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shelves.length === 0 ? (
              <TableRow>                <TableCell
                  colSpan={showWarehouse ? (showRack ? 7 : 6) : (showRack ? 6 : 5)}
                  className="text-center h-16 sm:h-24 p-2 sm:p-4 text-muted-foreground"
                >
                  No shelves found
                </TableCell>
              </TableRow>
            ) : (
              shelves.map((shelf) => (                <TableRow key={shelf.id}>
                  <TableCell className="font-medium p-2 sm:p-4">
                    <div className="flex flex-col">
                      <Link href={`/dashboard/shelves/${shelf.id}`} className="hover:underline line-clamp-1">
                        {shelf.shelfCode}
                      </Link>
                      <span className="text-xs text-muted-foreground mt-1 sm:hidden">
                        Position: {shelf.position}
                      </span>
                      {showRack && (
                        <span className="text-xs text-muted-foreground mt-0.5 md:hidden">
                          Rack: {shelf.rack.rackCode}
                        </span>
                      )}
                      {showWarehouse && (
                        <span className="text-xs text-muted-foreground mt-0.5 md:hidden">
                          {shelf.rack.warehouse.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground mt-0.5 sm:hidden">
                        Capacity: {shelf.capacityKg} kg
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">{shelf.position}</TableCell>
                  {showRack && (
                    <TableCell className="hidden md:table-cell p-2 sm:p-4">
                      <Link
                        href={`/dashboard/racks/${shelf.rackId}`}
                        className="hover:underline"
                      >
                        {shelf.rack.rackCode}
                      </Link>
                    </TableCell>
                  )}
                  {showWarehouse && (
                    <TableCell className="hidden md:table-cell p-2 sm:p-4">
                      <Link
                        href={`/dashboard/warehouses/${shelf.rack.warehouseId}`}
                        className="hover:underline"
                      >
                        {shelf.rack.warehouse.name}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">{shelf.capacityKg} kg</TableCell>
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                        shelf.status
                      )}`}
                    >
                      {getStatusText(shelf.status)}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 sm:p-4">                    <div className="flex gap-1 sm:gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs sm:text-sm" asChild>
                        <Link href={`/dashboard/shelves/${shelf.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(shelf)}
                        className="h-8 px-2 text-xs sm:text-sm text-red-600 hover:bg-red-100 hover:text-red-700"
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
      </div>      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
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
