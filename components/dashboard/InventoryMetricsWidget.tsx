import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, PackageOpen, Warehouse } from "lucide-react";
import Link from "next/link";

interface InventoryMetricsProps {
  metrics: {
    totalInventoryItems: number;
    uniqueProductCount: number;
    warehousesWithInventory: number;
  };
}

export function InventoryMetricsWidget({ metrics }: InventoryMetricsProps) {
  const metricsData = [
    {
      title: "Total Inventory Items",
      value: metrics.totalInventoryItems,
      icon: Box,
      color: "bg-blue-500",
      link: "/dashboard/inventory"
    },
    {
      title: "Unique Products",
      value: metrics.uniqueProductCount,
      icon: PackageOpen,
      color: "bg-green-500",
      link: "/dashboard/products"
    },
    {
      title: "Warehouses with Inventory",
      value: metrics.warehousesWithInventory,
      icon: Warehouse,
      color: "bg-purple-500",
      link: "/dashboard/warehouses"
    },  ];  return (    <div className="w-full">
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-3">{metricsData.map((metric) => (
          <Card key={metric.title} className="metric-card hover:border-indigo-200 group cursor-pointer transition-all duration-300 !mb-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                {metric.title}
              </CardTitle>
              <div className={`rounded-xl p-3 ${metric.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {metric.value}
              </div>
              <Link 
                href={metric.link}
                className="text-xs text-muted-foreground hover:underline leading-tight mt-1 inline-block"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
