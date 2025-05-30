// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, PackageOpen, ListChecks, BarChart3 } from "lucide-react";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { LowStockWidget } from "@/components/dashboard/LowStockWidget";
import { InventoryMetricsWidget } from "@/components/dashboard/InventoryMetricsWidget";
import {
  getLowStockAlerts,
  getRecentActivity,
  getInventoryMetrics,
} from "@/app/actions/dashboard";
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

  const lowStockProducts =
    lowStockResult.success && lowStockResult.data ? lowStockResult.data : [];

  const recentActivities =
    recentActivityResult.success && recentActivityResult.data
      ? recentActivityResult.data
      : [];

  const inventoryMetrics =
    inventoryMetricsResult.success && inventoryMetricsResult.data
      ? inventoryMetricsResult.data
      : {
          totalInventoryItems: 0,
          uniqueProductCount: 0,
          warehousesWithInventory: 0,
        };  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="space-y-8 sm:space-y-10 py-6 sm:py-8">
        {/* Dashboard Header */}
        <div className="text-center py-6 sm:py-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Welcome to your advanced Inventory Management System dashboard.
          </p>
        </div>

        {/* Summary Cards Section */}
        <div className="dashboard-section dashboard-metrics">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 card-container">
            {summaryCards.map((card, index) => (
              <Card key={card.title} className={`metric-card hover:border-indigo-200 group cursor-pointer transition-all duration-300 delay-${index * 100}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </CardTitle>
                  <div className={`rounded-xl p-3 ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Inventory Metrics Section */}
        <div className="dashboard-section dashboard-widgets">
          <div className="px-2 sm:px-0">
            <InventoryMetricsWidget metrics={inventoryMetrics} />
          </div>
        </div>

        {/* Widgets Section */}
        <div className="dashboard-section dashboard-widgets">
          <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 card-container">
            <div className="lg:col-span-1 xl:col-span-2 px-2 sm:px-0">
              <RecentActivityWidget activities={recentActivities} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1 px-2 sm:px-0">
              <LowStockWidget products={lowStockProducts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
