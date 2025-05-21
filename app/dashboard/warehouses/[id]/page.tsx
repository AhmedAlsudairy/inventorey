// app/dashboard/warehouses/[id]/page.tsx
import { getWarehouse } from "@/app/actions/warehouse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Loader2, PenLine, Plus } from "lucide-react";
import { Suspense } from "react";
import { RackTable } from "@/components/rack/RackTable";

export type ParamsType = Promise<{ id: string }>;

interface WarehousePageProps {
  params: ParamsType;
}

// Loading component
function WarehouseDetailsLoading() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function WarehousePage({ params }: WarehousePageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id) || id <= 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Warehouse Details</h1>
        <Button asChild>
          <Link href={`/dashboard/warehouses/${id}/edit`}>
            <PenLine className="mr-2 h-4 w-4" />
            Edit Warehouse
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<WarehouseDetailsLoading />}>
        <WarehouseDetails id={id} />
      </Suspense>
    </div>
  );
}

async function WarehouseDetails({ id }: { id: number }) {
  const warehouse = await getWarehouse(id);
  
  if (!warehouse) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      {/* Warehouse info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Warehouse Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{warehouse.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-lg">{warehouse.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                warehouse.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : warehouse.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {warehouse.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Racks list */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Racks</CardTitle>
          <Button asChild size="sm">
            <Link href={`/dashboard/racks/new?warehouseId=${warehouse.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rack
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {warehouse.racks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No racks found. Add your first rack to this warehouse.
            </p>
          ) : (
            /* Adapt rack data to match RackTable expected format */
            <RackTable 
              racks={warehouse.racks.map(rack => ({
                ...rack,
                warehouse: {
                  name: warehouse.name
                },
                _count: rack._count || { shelves: 0 }
              }))} 
              showWarehouse={false} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}