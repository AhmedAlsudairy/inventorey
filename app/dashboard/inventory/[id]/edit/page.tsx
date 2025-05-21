// app/dashboard/inventory/[id]/edit/page.tsx
import { getProducts } from "@/app/actions/product";
import { getWarehousesWithRacksAndShelves } from "@/app/actions/warehouse";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import InventoryForm from "@/components/inventory/InventoryForm";
import { PageTitle } from "@/components/ui/page-title";
import { getInventoryItem } from "@/app/actions/inventory/getInventoryItem";

export type ParamsType = Promise<{ id: string }>;

interface EditInventoryPageProps {
  params: ParamsType;
}

export default async function EditInventoryPage({ params }: EditInventoryPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const inventoryId = parseInt(id, 10);
  
  if (isNaN(inventoryId) || inventoryId <= 0) {
    notFound();
  }
  // Fetch the inventory item
  const inventory = await getInventoryItem(inventoryId);
  
  if (!inventory) {
    notFound();
  }
  
  // Convert Date objects to ISO strings to match expected types in InventoryForm
  const formattedInventory = {
    ...inventory,
    expiryDate: inventory.expiryDate instanceof Date
      ? inventory.expiryDate.toISOString().split('T')[0] 
      : inventory.expiryDate
  };
  
  // Fetch required data for the form
  const products = await getProducts();
  const warehouses = await getWarehousesWithRacksAndShelves();
  
  return (
    <div className="container mx-auto py-6">
      <PageTitle 
        title="Edit Inventory" 
        subtitle="Update inventory details"
        backUrl={`/dashboard/inventory/${inventoryId}`}
      />
      
      <div className="mt-6">
        <InventoryForm 
          products={products}
          warehouses={warehouses}
          initialData={formattedInventory}
          isEditing={true}
        />
      </div>
    </div>
  );
}