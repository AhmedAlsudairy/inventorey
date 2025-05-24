// app/dashboard/racks/[id]/page.tsx
import { getRack } from "@/app/actions/rack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Loader2, PenLine, Plus } from "lucide-react";
import { Suspense } from "react";
import { ShelfTable } from "@/components/shelf/ShelfTable";
import { Prisma } from "@prisma/client";

export type ParamsType = Promise<{
  id: string;
}>;

interface RackPageProps {
  params: ParamsType;
}

// Loading component
function RackDetailsLoading() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function RackPage({ params }: RackPageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id) || id <= 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Rack Details</h1>
        <Button asChild>
          <Link href={`/dashboard/racks/${id}/edit`}>
            <PenLine className="mr-2 h-4 w-4" />
            Edit Rack
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<RackDetailsLoading />}>
        <RackDetails id={id} />
      </Suspense>
    </div>
  );
}

async function RackDetails({ id }: { id: number }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const rack = await getRack(id);
  
  if (!rack) {
    notFound();
  }  const formatDimensions = (dimensions: Prisma.JsonValue) => {
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
            <Link href={`/dashboard/warehouses/${rack.warehouseId}`} className="hover:underline font-medium">
              {rack.warehouse.name}
            </Link>
            <span>→</span>
            <span className="font-medium">Rack {rack.rackCode}</span>
            <span>({rack.location})</span>
          </div>
        </CardContent>
      </Card>

      {/* Rack info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Rack Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rack Code</p>
              <p className="text-lg">{rack.rackCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location within Warehouse</p>
              <p className="text-lg">{rack.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(rack.status)}`}>
                {getStatusText(rack.status)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
              <Link href={`/dashboard/warehouses/${rack.warehouseId}`} className="text-lg hover:underline text-blue-600">
                {rack.warehouse.name}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Number of Shelves</p>
              <p className="text-lg">{rack.numShelves}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
              <p className="text-lg">{formatDimensions(rack.dimensions)}</p>
            </div>
          </div>
        </CardContent>
      </Card>{/* Shelves list */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Shelves</CardTitle>
          <Button asChild size="sm">
            <Link href={`/dashboard/shelves/new?rackId=${rack.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Shelf
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {rack.shelves.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No shelves found. Add your first shelf to this rack.
            </p>
          ) : (
            <ShelfTable 
              shelves={rack.shelves.map(shelf => ({
                ...shelf,
                rack: {
                  rackCode: rack.rackCode,
                  warehouseId: rack.warehouseId,
                  warehouse: rack.warehouse
                },
                _count: {
                  inventory: shelf._count?.inventory || 0
                }
              }))} 
              showRack={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
