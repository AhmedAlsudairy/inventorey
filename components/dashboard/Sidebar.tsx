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
    <div className="hidden md:flex flex-col h-full w-64 glass-effect border-r border-white/20">
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Inventory System
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-gray-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-md hover:transform hover:scale-105"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-300 ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-white"
                    : "text-gray-500 group-hover:text-indigo-500 group-hover:scale-110"
                }`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
