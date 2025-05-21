import { getInventoryDetail } from '@/app/actions/inventory'
import { getAllWarehouses } from '@/app/actions/warehouse'
import InventoryTransferForm from '@/components/inventory/InventoryTransferForm'
import { notFound } from 'next/navigation'

export type ParamsType = Promise<{ id: string }>;

interface PageProps {
  params: ParamsType
}

export default async function TransferPage({ params }: PageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  if (isNaN(id)) {
    return notFound()
  }
  
  try {
    const [inventory, warehouses] = await Promise.all([
      getInventoryDetail(id),
      getAllWarehouses()
    ])
    
    return (
      <div className="container mx-auto py-6">
        <InventoryTransferForm 
          inventory={inventory}
          warehouses={warehouses}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading transfer page:', error)
    return notFound()
  }
}