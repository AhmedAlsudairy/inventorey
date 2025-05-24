// app/dashboard/shelves/[id]/page.tsx
import { getShelf } from "@/app/actions/shelf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";
import { Loader2, PenLine, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Suspense } from "react";

export type ParamsType = Promise<{
  id: string;
}>;

interface ShelfPageProps {
  params: ParamsType;
}

// Loading component
function ShelfDetailsLoading() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function ShelfPage({ params }: ShelfPageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id) || id <= 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Shelf Details</h1>
        <Button asChild>
          <Link href={`/dashboard/shelves/${id}/edit`}>
            <PenLine className="mr-2 h-4 w-4" />
            Edit Shelf
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<ShelfDetailsLoading />}>
        <ShelfDetails id={id} />
      </Suspense>
    </div>
  );
}

async function ShelfDetails({ id }: { id: number }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const shelf = await getShelf(id);
  
  if (!shelf) {
    notFound();
  }

  const formatDimensions = (dimensions: Prisma.JsonValue) => {
    if (!dimensions || typeof dimensions !== 'object') return 'N/A';
    const dim = dimensions as Record<string, unknown>;
    return `${dim.height || 0} × ${dim.width || 0} × ${dim.depth || 0} cm`;
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return "Active";
      case 2: return "Maintenance";
      default: return "Inactive";
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      default: return "bg-red-100 text-red-800";
    }
  };
  return (
    <div className="grid gap-6">
      {/* Location Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Location Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/dashboard/warehouses/${shelf.rack.warehouseId}`} className="hover:underline font-medium">
              {shelf.rack.warehouse.name}
            </Link>
            <span>→</span>
            <Link href={`/dashboard/racks/${shelf.rackId}`} className="hover:underline font-medium">
              Rack {shelf.rack.rackCode}
            </Link>
            <span>→</span>
            <span className="font-medium">Shelf {shelf.shelfCode}</span>
            <span>({shelf.position})</span>
          </div>
        </CardContent>
      </Card>

      {/* Shelf info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Shelf Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shelf Code</p>
              <p className="text-lg">{shelf.shelfCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Position on Rack</p>
              <p className="text-lg">{shelf.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(shelf.status)}`}>
                {getStatusText(shelf.status)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rack</p>
              <Link href={`/dashboard/racks/${shelf.rackId}`} className="text-lg hover:underline text-blue-600">
                {shelf.rack.rackCode} ({shelf.rack.location})
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
              <Link href={`/dashboard/warehouses/${shelf.rack.warehouseId}`} className="text-lg hover:underline text-blue-600">
                {shelf.rack.warehouse.name}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Capacity</p>
              <p className="text-lg">{shelf.capacityKg} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
              <p className="text-lg">{formatDimensions(shelf.dimensions)}</p>
            </div>
          </div>
        </CardContent>
      </Card>{/* Inventory items list */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Inventory Items</CardTitle>
          <Button asChild size="sm">
            <Link href={`/dashboard/inventory/new?shelfId=${shelf.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Inventory
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {shelf.inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No inventory items found on this shelf.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Product Info</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Batch/Lot</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shelf.inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/inventory/${item.id}`} className="hover:underline">
                          {item.product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">{item.product.sku}</div>
                          <div className="flex gap-1 flex-wrap">
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
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.batchNumber || "-"}</TableCell>
                      <TableCell>
                        {item.expiryDate 
                          ? new Date(item.expiryDate).toLocaleDateString() 
                          : "-"}
                      </TableCell>
                      <TableCell>
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
                            asChild
                          >
                            <Link 
                              href={`/dashboard/inventory/${item.id}`}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            asChild
                          >
                            <Link 
                              href={`/dashboard/inventory/${item.id}/delete`}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
