// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Warehouse,
  PackageOpen,
  FolderTree,
  Package,
  BarChart3,

  ClipboardCheck,
} from "lucide-react";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Warehouses",
    href: "/dashboard/warehouses",
    icon: Warehouse,
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: PackageOpen,
  },  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: FolderTree,
  },  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Status",
    href: "/dashboard/status",
    icon: ClipboardCheck,
  },
//   {
//     name: "Users",
//     href: "/dashboard/users",
//     icon: Users,
//   },
//   {
//     name: "Settings",
//     href: "/dashboard/settings",
//     icon: Settings,
//   },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="hidden md:flex flex-col h-full w-64 border-r bg-background">
      <div className="flex items-center h-14 ps-6 border-b">
        <span className="text-lg font-semibold">Inventory System</span>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
