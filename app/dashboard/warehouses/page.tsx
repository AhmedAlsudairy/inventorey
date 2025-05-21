// app/dashboard/warehouses/page.tsx
import { getWarehouses, deleteWarehouse } from "@/app/actions/warehouse";
import { WarehouseTable } from "@/components/warehouse/WarehouseTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading component for warehouses
function WarehousesTableLoading() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function WarehousesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
        <Button asChild>
          <Link href="/dashboard/warehouses/new">Add Warehouse</Link>
        </Button>
      </div>
      
      <Suspense fallback={<WarehousesTableLoading />}>
        <WarehousesList />
      </Suspense>
    </div>
  );
}

async function WarehousesList() {
  const warehouses = await getWarehouses();
  
  return <WarehouseTable warehouses={warehouses} deleteWarehouse={deleteWarehouse} />;
}
