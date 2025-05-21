import { getInventoryDetail } from '@/app/actions/inventory'
import InventoryDetail from '@/components/inventory/InventoryDetail'
import { notFound } from 'next/navigation'

export type ParamsType = Promise<{ id: string }>;

interface PageProps {
  params: ParamsType
}

export default async function InventoryDetailPage({ params }: PageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  if (isNaN(id)) {
    return notFound()
  }
  
  try {
    const inventoryDetail = await getInventoryDetail(id)
    
    return (
      <div className="container mx-auto py-6">
        <InventoryDetail inventory={inventoryDetail} />
      </div>
    )
  } catch (error) {
    console.log(error)
    return notFound()
  }
}