// app/dashboard/shelves/new/page.tsx
import { getRacks } from "@/app/actions/rack";
import { ShelfForm } from "@/components/shelf/ShelfForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type SearchParamsType = Promise<{
  rackId?: string;
}>;

interface PageProps {
  searchParams: SearchParamsType;
}

export default async function NewShelfPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const racks = await getRacks();
  
  // Await and resolve the searchParams Promise
  const resolvedSearchParams = await searchParams;
  
  const defaultRackId = resolvedSearchParams.rackId ? 
    parseInt(resolvedSearchParams.rackId, 10) : 
    undefined;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Shelf</h1>
        <p className="text-muted-foreground">
          Add a new shelf to your rack
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <ShelfForm 
          racks={racks}
          defaultRackId={defaultRackId} 
        />
      </div>
    </div>
  );
}
