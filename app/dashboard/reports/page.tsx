import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { 
  getInventoryValueByProduct, 
  getInventoryValueByCategory, 
  getInventoryValueByLocation 
} from "@/app/actions/reports";
import { getLowStockAlerts } from "@/app/actions/dashboard";
import { InventoryValueTable } from "@/components/reports/InventoryValueTable";
import { CategoryValueChart } from "@/components/reports/CategoryValueChart";
import { LocationValueChart } from "@/components/reports/LocationValueChart";
import { LowStockAlertChart } from "@/components/reports/LowStockAlertChart";

export default async function ReportsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch data for report components
  const productValueResult = await getInventoryValueByProduct();
  const categoryValueResult = await getInventoryValueByCategory();
  const locationValueResult = await getInventoryValueByLocation();
  const lowStockResult = await getLowStockAlerts(10);

  const products = productValueResult.success && productValueResult.data 
    ? productValueResult.data
    : [];
    
  const categories = categoryValueResult.success && categoryValueResult.data
    ? categoryValueResult.data
    : [];
    
  const categoryTotalValue = categoryValueResult.success && categoryValueResult.totalValue
    ? categoryValueResult.totalValue
    : 0;
    
  const locations = locationValueResult.success && locationValueResult.data
    ? locationValueResult.data
    : [];
    
  const locationTotalValue = locationValueResult.success && locationValueResult.totalValue
    ? locationValueResult.totalValue
    : 0;
    
  const lowStockProducts = lowStockResult.success && lowStockResult.data
    ? lowStockResult.data
    : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Inventory value reports and analytics
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <LowStockAlertChart products={lowStockProducts} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryValueChart categories={categories} totalValue={categoryTotalValue} />
        <LocationValueChart locations={locations} totalValue={locationTotalValue} />
      </div>
      
      <div className="grid gap-4">
        <InventoryValueTable products={products} />
      </div>
    </div>
  );
}
