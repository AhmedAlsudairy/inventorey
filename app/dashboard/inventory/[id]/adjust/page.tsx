import { notFound } from 'next/navigation'
import { getInventoryDetail } from '@/app/actions/inventory'
import InventoryAdjustForm from '@/components/inventory/InventoryAdjustForm'

export type ParamsType = Promise<{ id: string }>;

interface PageProps {
  params: ParamsType
}

export default async function AdjustInventoryPage({ params }: PageProps) {
  // Await the resolved params
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  if (isNaN(id)) {
    return notFound()
  }
  
  try {
    const inventory = await getInventoryDetail(id)
    
    return (
      <div className="container mx-auto py-6">
        <InventoryAdjustForm inventory={inventory} />
      </div>
    )
  } catch (error) {
    console.log(error)
    return notFound()
  }
}