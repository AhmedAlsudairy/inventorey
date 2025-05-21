"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LowStockProductType } from "@/app/actions/dashboard";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function LowStockAlertChart({ products }: { products: LowStockProductType[] }) {
  if (!products || products.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Low Stock Alert Analysis
          </CardTitle>
          <CardDescription>
            Products that require attention based on inventory levels
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No low stock items to display</p>
            <Button asChild>
              <Link href="/dashboard/inventory/new">Add Inventory</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort products by inventory level percentage (ascending)
  const sortedProducts = [...products].sort((a, b) => 
    (a.totalQuantity / a.threshold) - (b.totalQuantity / b.threshold)
  ).slice(0, 10); // Show top 10 lowest stock items
    // Prepare chart data
  const labels = sortedProducts.map(p => p.name);
  const currentStock = sortedProducts.map(p => p.totalQuantity);
  // const thresholds = sortedProducts.map(p => p.threshold);
  // Chart data is created and used directly in the component below
  //       data: currentStock,
  //       backgroundColor: 'rgba(75, 192, 192, 0.6)',
  //       borderColor: 'rgba(75, 192, 192, 1)',
  //       borderWidth: 1,
  //     },
  //     {
  //       type: 'line' as const,
  //       label: 'Threshold',
  //       data: thresholds,
  //       backgroundColor: 'rgba(255, 99, 132, 0.2)',
  //       borderColor: 'rgba(255, 99, 132, 1)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Product'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Low Stock Alert Analysis
          </CardTitle>
          <CardDescription>
            Products that require attention based on inventory levels
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/inventory/new" className="flex items-center">
            Restock <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Bar 
            data={{
              labels,
              datasets: [
                {
                  label: 'Current Stock',
                  data: currentStock,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            }} 
            options={options} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
