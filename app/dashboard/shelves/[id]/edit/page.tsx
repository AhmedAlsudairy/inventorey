// app/dashboard/shelves/[id]/edit/page.tsx
import { getRacks } from "@/app/actions/rack";
import { getShelf } from "@/app/actions/shelf";
import { ShelfForm } from "@/components/shelf/ShelfForm";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export type ParamsType = Promise<{
  id: string;
}>;

interface EditShelfPageProps {
  params: ParamsType;
}

export default async function EditShelfPage({ params }: EditShelfPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id) || id <= 0) {
    notFound();
  }
  
  const shelf = await getShelf(id);
  const racks = await getRacks();
  
  if (!shelf) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Shelf</h1>
        <p className="text-muted-foreground">
          Update shelf information
        </p>
      </div>
      
      <div className="rounded-md border p-6">
        <ShelfForm
          racks={racks}
          initialData={{
            id: shelf.id,
            rackId: shelf.rackId,
            shelfCode: shelf.shelfCode,
            position: shelf.position,
            dimensions: shelf.dimensions as {
              height: number;
              width: number;
              depth: number;
            },
            capacityKg: shelf.capacityKg,
            status: shelf.status,
          }}
        />
      </div>
    </div>
  );
}
