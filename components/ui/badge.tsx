import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md hover:scale-105",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:shadow-md hover:scale-105",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-md hover:scale-105",
        outline: "text-gray-700 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-105",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-md hover:scale-105",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-md hover:scale-105",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-md hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
