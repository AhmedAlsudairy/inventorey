// app/dashboard/warehouses/[id]/edit/page.tsx
import { getWarehouse, updateWarehouse } from "@/app/actions/warehouse";
import { WarehouseForm } from "@/components/warehouse/WarehouseForm";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export type ParamsType = Promise<{ id: string }>;

interface EditWarehousePageProps {
  params: ParamsType;
}

export default async function EditWarehousePage({ params }: EditWarehousePageProps) {
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
  
  const warehouse = await getWarehouse(id);
  
  if (!warehouse) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Warehouse</h1>
        <p className="text-muted-foreground">
          Update warehouse information
        </p>
      </div>
      
      <div className="border rounded-lg p-4 md:p-6">
        <WarehouseForm 
          warehouse={warehouse} 
          updateWarehouse={updateWarehouse} 
        />
      </div>
    </div>
  );
}