// app/dashboard/shelves/page.tsx
import { getShelves } from "@/app/actions/shelf";
import { Button } from "@/components/ui/button";
import { ShelfTable } from "@/components/shelf/ShelfTable";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function ShelvesLoading() {
  return <div className="text-center py-4">Loading shelves...</div>;
}

export default async function ShelvesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Shelves</h1>
        <Button asChild>
          <Link href="/dashboard/shelves/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Shelf
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ShelvesLoading />}>
        <ShelvesList />
      </Suspense>
    </div>
  );
}

async function ShelvesList() {
  const shelves = await getShelves();

  return <ShelfTable shelves={shelves} showRack={true} showWarehouse={true} />;
}
