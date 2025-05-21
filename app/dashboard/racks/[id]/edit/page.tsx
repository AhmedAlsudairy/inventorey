// app/dashboard/racks/[id]/edit/page.tsx
import { getRack } from "@/app/actions/rack";
import { getWarehouses } from "@/app/actions/warehouse";
import { RackForm } from "@/components/rack/RackForm";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export type ParamsType = Promise<{
  id: string;
}>;

interface EditRackPageProps {
  params: ParamsType;
}

export default async function EditRackPage({ params }: EditRackPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id) || id <= 0) {
    notFound();
  }
  
  const rack = await getRack(id);
  const warehouses = await getWarehouses();
  
  if (!rack) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Rack</h1>
        <p className="text-muted-foreground">
          Update rack information
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <RackForm
          warehouses={warehouses}
          initialData={{
            id: rack.id,
            warehouseId: rack.warehouseId,
            rackCode: rack.rackCode,
            location: rack.location,
            numShelves: rack.numShelves,
            dimensions: rack.dimensions as {
              height: number;
              width: number;
              depth: number;
            },
            status: rack.status,
          }}
        />
      </div>
    </div>
  );
}
