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
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-3">
      {metricsData.map((metric) => (
        <Card key={metric.title} className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${metric.color}`}>
              <metric.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <Link 
              href={metric.link}
              className="text-xs text-muted-foreground hover:underline"
            >
              View details
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
