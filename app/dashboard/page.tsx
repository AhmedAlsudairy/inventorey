// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Warehouse, PackageOpen, ListChecks, BarChart3 } from "lucide-react";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { LowStockWidget } from "@/components/dashboard/LowStockWidget";
import { InventoryMetricsWidget } from "@/components/dashboard/InventoryMetricsWidget";
import { getLowStockAlerts, getRecentActivity, getInventoryMetrics } from "@/app/actions/dashboard";
import { initializeStatusTypes } from "@/app/actions/initialize";

export default async function DashboardPage() {
  // Initialize default status types if needed
  await initializeStatusTypes();
  
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get summary counts from database
  const warehousesCount = await db.warehouse.count();
  const productsCount = await db.product.count();
  const inventoryCount = await db.inventory.count();
  const categoriesCount = await db.category.count();

  // Summary cards data
  const summaryCards = [
    {
      title: "Warehouses",
      value: warehousesCount,
      description: "Total warehouses in the system",
      icon: Warehouse,
      color: "bg-blue-500",
    },
    {
      title: "Products",
      value: productsCount,
      description: "Total registered products",
      icon: PackageOpen,
      color: "bg-green-500",
    },
    {
      title: "Inventory Items",
      value: inventoryCount,
      description: "Total inventory entries",
      icon: ListChecks,
      color: "bg-orange-500",
    },
    {
      title: "Categories",
      value: categoriesCount,
      description: "Product categories",
      icon: BarChart3,
      color: "bg-purple-500",
    },
  ];
  // Fetch data for widgets
  const lowStockResult = await getLowStockAlerts(5);
  const recentActivityResult = await getRecentActivity(10);
  const inventoryMetricsResult = await getInventoryMetrics();

  const lowStockProducts = lowStockResult.success && lowStockResult.data 
    ? lowStockResult.data 
    : [];
  
  const recentActivities = recentActivityResult.success && recentActivityResult.data
    ? recentActivityResult.data
    : [];
  
  const inventoryMetrics = inventoryMetricsResult.success && inventoryMetricsResult.data
    ? inventoryMetricsResult.data
    : {
        totalInventoryItems: 0,
        uniqueProductCount: 0,
        warehousesWithInventory: 0
      };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome to the Inventory Management System dashboard.
        </p>      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${card.color}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground leading-tight">
                {card.description}
              </p>
            </CardContent></Card>        ))}
      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
        <InventoryMetricsWidget metrics={inventoryMetrics} />
      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivityWidget activities={recentActivities} />
        <LowStockWidget products={lowStockProducts} />
      </div>
    </div>
  );
}
