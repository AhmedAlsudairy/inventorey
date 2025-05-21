"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationValueReportType } from "@/app/actions/reports";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function generateRandomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

export function LocationValueChart({ locations, totalValue }: { 
  locations: LocationValueReportType[];
  totalValue: number;
}) {
  // Generate colors for the chart
  const colors = locations.map(() => generateRandomColor());
  
  const chartData = {
    labels: locations.map(location => location.warehouseName),
    datasets: [
      {
        data: locations.map(location => location.totalValue),
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
        <CardTitle>Inventory Value by Location</CardTitle>
        <CardDescription>
          Total value: ${totalValue.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
