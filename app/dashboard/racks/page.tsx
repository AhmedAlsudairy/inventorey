// app/dashboard/racks/page.tsx
import { getRacks } from "@/app/actions/rack";
import { Button } from "@/components/ui/button";
import { RackTable } from "@/components/rack/RackTable";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function RacksLoading() {
  return <div className="text-center py-4">Loading racks...</div>;
}

export default async function RacksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Racks</h1>
        <Button asChild>
          <Link href="/dashboard/racks/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Rack
          </Link>
        </Button>
      </div>

      <Suspense fallback={<RacksLoading />}>
        <RacksList />
      </Suspense>
    </div>
  );
}

async function RacksList() {
  const racks = await getRacks();

  return <RackTable racks={racks} showWarehouse={true} />;
}
