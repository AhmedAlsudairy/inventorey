import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivityType } from "@/app/actions/dashboard";
import { Activity, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";

// Helper function to get icon based on transaction type
const getTransactionIcon = (transactionType: string) => {
  switch (transactionType) {
    case 'add':
      return <ArrowUp className="mr-2 h-4 w-4 text-green-500" />;
    case 'remove':
      return <ArrowDown className="mr-2 h-4 w-4 text-red-500" />;
    case 'transfer':
      return <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />;
    default:
      return <Activity className="mr-2 h-4 w-4 text-gray-500" />;
  }
};

// Helper function to format transaction description
const getTransactionDescription = (activity: RecentActivityType) => {
  switch (activity.transactionType) {
    case 'add':
      return `Added ${activity.quantityChange} ${activity.unit} of ${activity.productName}`;
    case 'remove':
      return `Removed ${Math.abs(activity.quantityChange)} ${activity.unit} of ${activity.productName}`;
    case 'transfer':
      return `Transferred ${Math.abs(activity.quantityChange)} ${activity.unit} of ${activity.productName}`;
    case 'adjust':
      return `Adjusted ${activity.productName} by ${activity.quantityChange} ${activity.unit}`;
    default:
      return `${activity.transactionType} ${activity.quantityChange} ${activity.unit} of ${activity.productName}`;
  }
};

export function RecentActivityWidget({ activities }: { activities: RecentActivityType[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2 !bg-white/90 !backdrop-blur-xl !rounded-3xl !border-white/30 !p-6 sm:!p-8 !shadow-xl !shadow-black/5 hover:!shadow-2xl hover:!shadow-black/10 !transition-all !duration-300">
      <CardHeader className="!p-0 !pb-6">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Activity className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="!p-0">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No recent activity to display.
          </p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start">
                <div className="bg-muted p-2 rounded-full mr-3 mt-0.5">
                  {getTransactionIcon(activity.transactionType)}
                </div>                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium line-clamp-2">
                    {getTransactionDescription(activity)}
                  </p>
                  <div className="flex flex-wrap items-center text-xs text-muted-foreground">
                    <span>
                      {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                    </span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="w-full sm:w-auto mt-1 sm:mt-0">{activity.reason || 'No reason provided'}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
