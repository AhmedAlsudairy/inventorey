// app/dashboard/racks/new/page.tsx
import { getWarehouses } from "@/app/actions/warehouse";
import { RackForm } from "@/components/rack/RackForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type SearchParamsType = Promise<{
  warehouseId?: string;
}>;

interface PageProps {
  searchParams: SearchParamsType;
}

export default async function NewRackPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const warehouses = await getWarehouses();
  
  // Await and resolve the searchParams Promise
  const resolvedSearchParams = await searchParams;
  
  const defaultWarehouseId = resolvedSearchParams.warehouseId ? 
    parseInt(resolvedSearchParams.warehouseId, 10) : 
    undefined;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Rack</h1>
        <p className="text-muted-foreground">
          Add a new rack to your warehouse system
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <RackForm 
          warehouses={warehouses}
          defaultWarehouseId={defaultWarehouseId} 
        />
      </div>
    </div>
  );
}
