// components/rack/RackTable.tsx
"use client";

import { deleteRack } from "@/app/actions/rack";
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
import { Rack } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface RackWithRelations extends Rack {
  warehouse: {
    name: string;
  };
  _count: {
    shelves: number;
  };
}

interface RackTableProps {
  racks: RackWithRelations[];
  showWarehouse?: boolean;
}

export function RackTable({ racks, showWarehouse = false }: RackTableProps) {  
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRack, setSelectedRack] = useState<RackWithRelations | null>(null);
  const router = useRouter();

  const handleDeleteClick = (rack: RackWithRelations) => {
    setSelectedRack(rack);
    setDialogOpen(true);
  };  const handleDelete = async () => {
    if (!selectedRack) return;
    setIsDeleting(true);
    
    const formData = new FormData();
    formData.append("id", selectedRack.id.toString());
    formData.append("warehouseId", selectedRack.warehouseId.toString());

    const result = await deleteRack(formData);

    if (result.success) {
      toast.success("Rack deleted successfully");
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete rack");
    }    setIsDeleting(false);
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
              <TableHead>Rack Code</TableHead>
              <TableHead>Location</TableHead>
              {showWarehouse && <TableHead>Warehouse</TableHead>}
              <TableHead>Shelves</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {racks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showWarehouse ? 6 : 5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No racks found
                </TableCell>
              </TableRow>
            ) : (
              racks.map((rack) => (
                <TableRow key={rack.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/racks/${rack.id}`} className="hover:underline">
                      {rack.rackCode}
                    </Link>
                  </TableCell>
                  <TableCell>{rack.location}</TableCell>
                  {showWarehouse && (
                    <TableCell>
                      <Link
                        href={`/dashboard/warehouses/${rack.warehouseId}`}
                        className="hover:underline"
                      >
                        {rack.warehouse.name}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell>{rack._count.shelves}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                        rack.status
                      )}`}
                    >
                      {getStatusText(rack.status)}
                    </span>
                  </TableCell>                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/racks/${rack.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(rack)}
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
              Are you sure you want to delete rack{" "}
              <span className="font-bold">{selectedRack?.rackCode}</span>?
              {selectedRack && selectedRack._count.shelves > 0 && (
                <p className="text-red-500 mt-2">
                  This rack has {selectedRack._count.shelves} shelves. You must remove
                  all shelves before deleting the rack.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>            <Button
              variant="destructive"
              onClick={handleDelete}              disabled={
                isDeleting ||
                !!(selectedRack && selectedRack._count.shelves > 0)
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
