import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LowStockProductType } from "@/app/actions/dashboard";
import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export function LowStockWidget({ products }: { products: LowStockProductType[] }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No low stock alerts at this time.
          </p>
        ) : (
          <ul className="space-y-4">
            {products.map((product) => {
              // Calculate percentage of threshold
              const percentage = Math.min(Math.round((product.totalQuantity / product.threshold) * 100), 100);
              let progressColor = "bg-red-500";
              
              if (percentage > 75) {
                progressColor = "bg-green-500";
              } else if (percentage > 50) {
                progressColor = "bg-amber-500";
              } else if (percentage > 25) {
                progressColor = "bg-orange-500";
              }
              
              return (
                <li key={product.id} className="space-y-2">                  <div className="flex justify-between items-center">
                    <Link 
                      href={`/dashboard/products/${product.id}`}
                      className="text-sm font-medium hover:underline truncate max-w-[60%]"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      indicatorClassName={progressColor}
                    />
                    <span className="text-sm font-medium">
                      {product.totalQuantity}/{product.threshold} {product.primaryUnit}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
