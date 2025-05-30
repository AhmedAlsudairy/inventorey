import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LowStockProductType } from "@/app/actions/dashboard";
import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export function LowStockWidget({ products }: { products: LowStockProductType[] }) {
  return (
    <Card className="w-full group hover:shadow-xl transition-all duration-300 mx-2 sm:mx-0">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center text-lg">
          <AlertTriangle className="mr-3 h-6 w-6 text-amber-500 group-hover:animate-pulse" />
          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
            Low Stock Alerts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No low stock alerts at this time.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All inventory levels are healthy!
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {products.map((product) => {
              // Calculate percentage of threshold
              const percentage = Math.min(Math.round((product.totalQuantity / product.threshold) * 100), 100);
              let progressColor = "from-red-500 to-rose-600";
              let bgColor = "from-red-50 to-rose-50";
              
              if (percentage > 75) {
                progressColor = "from-green-500 to-emerald-600";
                bgColor = "from-green-50 to-emerald-50";
              } else if (percentage > 50) {
                progressColor = "from-amber-500 to-orange-600";
                bgColor = "from-amber-50 to-orange-50";
              } else if (percentage > 25) {
                progressColor = "from-orange-500 to-red-600";
                bgColor = "from-orange-50 to-red-50";
              }
              
              return (
                <li key={product.id} className={`p-4 rounded-xl bg-gradient-to-r ${bgColor} border border-white/50 hover:shadow-md transition-all duration-300`}>
                  <div className="flex justify-between items-center mb-3">
                    <Link 
                      href={`/dashboard/products/${product.id}`}
                      className="text-sm font-semibold hover:underline truncate max-w-[60%] text-gray-800 hover:text-indigo-600 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs font-mono text-muted-foreground bg-white/60 px-2 py-1 rounded-md">
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Progress 
                        value={percentage} 
                        className="h-3 bg-white/60"
                        indicatorClassName={`bg-gradient-to-r ${progressColor} shadow-sm`}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 min-w-fit">
                      {product.totalQuantity}/{product.threshold} {product.primaryUnit}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Stock level: {percentage}%
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
