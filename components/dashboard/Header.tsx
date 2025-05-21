// components/dashboard/Header.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/dashboard/MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Mobile menu button */}
        <MobileNav />

        {/* Logo - Visible on mobile */}
        <div className="md:hidden">
          <Link href="/dashboard" className="font-medium">
            Inventory System
          </Link>
        </div>

        {/* Right-side header items */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
