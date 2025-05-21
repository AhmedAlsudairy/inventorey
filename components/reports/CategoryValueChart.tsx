"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryValueReportType } from "@/app/actions/reports";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function generateRandomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

export function CategoryValueChart({ categories, totalValue }: { 
  categories: CategoryValueReportType[];
  totalValue: number;
}) {
  // Generate colors for the chart
  const colors = categories.map(() => generateRandomColor());
  
  const chartData = {
    labels: categories.map(category => category.categoryName),
    datasets: [
      {
        data: categories.map(category => category.totalValue),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace("0.6", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Inventory Value by Category</CardTitle>
        <CardDescription>
          Total value: ${totalValue.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Pie data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
