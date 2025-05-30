// components/dashboard/Header.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/dashboard/MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full glass-effect border-b border-white/20 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile menu button */}
        <MobileNav />

        {/* Logo - Visible on mobile */}
        <div className="md:hidden">
          <Link href="/dashboard" className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Inventory System
          </Link>
        </div>

        {/* Right-side header items */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" />
          </Button>
          <div className="p-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
}
