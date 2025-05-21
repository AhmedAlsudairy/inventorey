// app/dashboard/warehouses/new/page.tsx
import { createWarehouse } from "@/app/actions/warehouse";
import { WarehouseForm } from "@/components/warehouse/WarehouseForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NewWarehousePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Warehouse</h1>
        <p className="text-muted-foreground">
          Add a new warehouse to your inventory system
        </p>
      </div>
      
      <div className="border rounded-lg p-4 md:p-6">
        <WarehouseForm createWarehouse={createWarehouse} />
      </div>
    </div>
  );
}
